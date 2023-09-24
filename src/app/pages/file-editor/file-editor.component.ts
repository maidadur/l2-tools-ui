import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { RSAKeys } from "../../constants/RSA-keys";
import { IFileEditOption } from "../../entity/FileEditOption";
import { IField, IFileTable } from "../../entity/FileTable";
import { IFile } from "../../entity/file";
import { RSACryptoService } from "../../servives/rsa-crypto.service";
import { L2BinaryReaderUtility } from "../../utilities/L2BinaryReader.utility";

@Component({
    templateUrl: './file-editor.component.html',
    styleUrls: ['./file-editor.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileEditorComponent {
    file!: IFile;
    rawContent = "";
    table!: IFileTable;
    isProcessing = false;
    fileEditOptions: IFileEditOption[] = [{
        fileName: "l2.ini",
        type: "raw",
        process: (arr) => this.rawContent = new TextDecoder().decode(arr)
    }, {
        fileName: "systemmsg-e.dat",
        type: "table",
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
        process: (arr) => this._parseTable(arr)
    }];
    selectedFileEditOption!: IFileEditOption;

    constructor(private _rsaCryptoService: RSACryptoService,
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
            this.selectedFileEditOption.process(decryptedContent);
            this.isProcessing = false;
            this._cdr.detectChanges();
        }, 200);
    }

    private _parseTable(data: Uint8Array): void {
        const reader = new L2BinaryReaderUtility(data);
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

        this.table = table;
    }

    private _getValue(reader: L2BinaryReaderUtility, field: IField): any {
        switch (field.type) {
            case "number": return reader.parseUInt();
            case "string": return reader.parseString();
            case "color":
                const b = reader.parseByteToHex();
                const g = reader.parseByteToHex();
                const r = reader.parseByteToHex();
                const a = reader.parseByteToHex();
                return r + g + b + a;

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
