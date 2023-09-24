import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { IFile } from "../../entity/file";

@Component({
    selector: 'app-file-import',
    templateUrl: './file-import.component.html',
    styleUrls: ['./file-import.component.scss']
})
export class FileImportComponent {
    @Output() onFileSelected = new EventEmitter<IFile>();

    @Input() asString = true;
    @Input() inputId = "fileImport";
    @Input() importButtonText = "Load file";
    @Input() accept!: string;
    @Input() disabled = false;

    @ViewChild("fileInput", { static: true }) fileInput!: ElementRef;

    fileIsSelected = false;
    fileName = "";

    onFileSelect(): void {
        const file: File = this.fileInput.nativeElement.files[0];
        if (!file) {
            return;
        }
        if (this.accept && !this.fileName.toLowerCase().endsWith(this.accept.toLowerCase())) {
            //TODO: change on toastr
            alert(`Please select file with extension ${this.accept}`);
            this.clear();
            return;
        }

        const reader = new FileReader();
        reader.addEventListener("load", event => {
            if (reader.result) {
                this.onFileSelected.emit({
                    content: reader.result,
                    name: this.fileName
                });
            } else {
                alert("No content.")
            }
        });
        //TODO: change on toastr
        reader.addEventListener("abort", event => alert("File reading was aborted on client side."));
        //TODO: change on toastr
        reader.addEventListener("error", event => alert("File reading failed because of error."));

        if (this.asString) {
            reader.readAsBinaryString(file);
        } else {
            reader.readAsArrayBuffer(file);
        }
    }

    open(): void {
        if (!this.disabled) {
            this.fileInput.nativeElement.click();
        }
    }

    clear(): void {
        this.fileIsSelected = false;
        this.fileName = "";
        this.fileInput.nativeElement.value = "";
    }

    fetchFileInfo(): void {
        if (this.fileInput && this.fileInput.nativeElement && this.fileInput.nativeElement.files[0]) {
            this.fileIsSelected = true;
            this.fileName = this.fileInput.nativeElement.files[0].name;
            this.onFileSelect();
        } else {
            this.fileIsSelected = false;
            this.fileName = "";
        }
    }
}
