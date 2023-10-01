import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FileImportComponent } from "../../components/file-import/file-import.component";
import { RSAKeys } from "../../constants/RSA-keys";
import { IFileEditOption } from "../../entity/FileEditOption";
import { IField, IFileTable } from "../../entity/FileTable";
import { IFile } from "../../entity/file";
import { FileSaver } from "../../helpers/fileSaver";
import { RSACryptoService } from "../../servives/rsa-crypto.service";
import { L2BinaryReader } from "../../utilities/L2BinaryReader.utility";
import { L2BinaryWriter } from "../../utilities/L2BinaryWriter.utility";
import { ArrayUtility } from "../../utilities/array.utility";

@Component({
    templateUrl: './file-editor.component.html',
    styleUrls: ['./file-editor.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileEditorComponent {
    @ViewChild(FileImportComponent) filePicker!: FileImportComponent;

    file!: IFile;
    rawContent = "";
    table!: IFileTable;
    isProcessing = false;
    byteFooter!: Uint8Array;
    fileEditOptions: IFileEditOption[] = [{
        fileName: "l2.ini",
        type: "raw",
        parse: (arr) => this.rawContent = this.bytesToString(arr),
        compress: () => this.stringToBytes(this.rawContent),
    }, {
        fileName: "systemmsg-e.dat",
        type: "table",
        parse: (arr) => this._parseTable(arr),
        compress: () => this._compressTable(),
        fields: [{
            name: "Id",
            internalName: "id",
            type: "number"
        }, {
            name: "Unknown(Ignore)",
            internalName: "unk",
            type: "number",
            isHidden: true
        }, {
            name: "Message",
            internalName: "message",
            type: "string",
            isEditable: true
        }, {
            name: "Group",
            internalName: "group",
            type: "number",
            fn: (p) => this._groupMapping(p)
        }, {
            name: "Color",
            internalName: "color",
            type: "color",
            isEditable: true
        }, {
            name: "Item Sound",
            internalName: "itemSound",
            type: "string",
            isHidden: true
        }, {
            name: "System Message Ref",
            internalName: "sysMsgRef",
            type: "string",
            isHidden: true
        }],
    }];
    selectedFileEditOption!: IFileEditOption;

    constructor(private _rsaCryptoService: RSACryptoService,
        private _arrayUtility: ArrayUtility,
        private _fileSaver: FileSaver,
        private _cdr: ChangeDetectorRef) { }

    getFilteredFields(): IField[] {
        return this.table.fields.filter(x => !x.isHidden);
    }

    onSelectedFile(file: IFile): void {
        this.isProcessing = true;
        setTimeout(async () => {
            const decryptedContent = await this._rsaCryptoService.decrypt(file.content as string, RSAKeys.modulus, RSAKeys.privateExponent);
            this.selectedFileEditOption = this.fileEditOptions.filter(x => x.fileName.toLowerCase() === file.name.toLowerCase())[0];
            if (!this.selectedFileEditOption) {
                alert("Didn't find proper parser.")
                return;
            }
            this.file = file;
            this.selectedFileEditOption.parse(decryptedContent);
            this.isProcessing = false;
            this._cdr.detectChanges();
        }, 200);
    }

    saveFile(): void {
        this.isProcessing = true;

        setTimeout(async () => {
            const content = this.selectedFileEditOption.compress();
            this.selectedFileEditOption = null as any;
            const encryptedBytes = await this._rsaCryptoService.encrypt(content, RSAKeys.modulus, RSAKeys.publicExponent, "Lineage2Ver413");
            this._fileSaver.saveBytes(this.file.name, encryptedBytes);
            this.filePicker.clear();
            this.isProcessing = false;
            this._cdr.detectChanges();
        }, 200);
    }

    stringToBytes(str: string): Uint8Array {
        return Buffer.from(str.replace(/[\n]/g, "\r\n"));
    }

    bytesToString(bytes: Uint8Array): string {
        return new TextDecoder().decode(bytes).replace(/\r\n/g, "\n");
    }

    private _compressTable(): Uint8Array {
        const writer = new L2BinaryWriter();
        writer.writeUint(this.table.rows.length);
        for (let i = 0; i < this.table.rows.length; i++) {
            const row = this.table.rows[i];
            for (let j = 0; j < this.table.fields.length; j++) {
                const field = this.table.fields[j];
                switch (field.type) {
                    case "string":
                        writer.writeString(row[field.internalName]);
                        break;
                    case "number":
                        writer.writeUint(row[field.internalName]);
                        break;
                    case "color":
                        writer.writeHex(row[field.internalName]);
                        writer.writeBytes([255]);
                        break;
                }
            }
        }

        writer.writeBytes(this.byteFooter);

        return this._arrayUtility.mergeUintArrays(writer.getBytes());
    }

    private _parseTable(data: Uint8Array): void {
        const reader = new L2BinaryReader(data);
        const amount = reader.parseUInt();
        const table = <IFileTable>{ fields: this.selectedFileEditOption.fields, rows: [] };
        for (let i = 0; i < amount; i++) {
            const obj = {} as any;
            for (let j = 0; j < table.fields.length; j++) {
                const field = table.fields[j];
                obj[field.internalName] = this._getValue(reader, field);
                if (field.fn) {
                    obj[field.internalName + "Mapped"] = field.fn(obj[field.internalName]);
                }
            }
            table.rows.push(obj);
        }

        this.byteFooter = reader.readBytesToEnd();

        this.table = table;
    }

    getWidth(field: IField): string {
        if (field.internalName === "id") {
            return "100px";
        }
        if (field.internalName === "group") {
            return "200px";
        }
        if (field.type === "color") {
            return "350px";
        }
        return "auto"
    }

    private _getValue(reader: L2BinaryReader, field: IField): any {
        switch (field.type) {
            case "number": return reader.parseUInt();
            case "string": return reader.parseString();
            case "color":
                const b = reader.parseByteToHex();
                const g = reader.parseByteToHex();
                const r = reader.parseByteToHex();
                const a = reader.parseByteToHex();
                return '#' + r + g + b;

            default:
                alert("Error no value for field type " + field.type);
                throw new Error("No value for " + field.type);
        }
    }

    private _groupMapping(num: number): string {
        switch (num) {
            case 0: return "None/Siege";
            case 1: return "Battle";
            case 2: return "Server";
            case 3: return "Damage";
            case 4: return "Popup";
            case 5: return "Error";
            case 6: return "Petition";
            case 7: return "Use Items";

            default: return "";
        }
    }
}
