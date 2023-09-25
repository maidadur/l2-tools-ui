import { Injectable } from "@angular/core";
import * as saveAs from "file-saver";

@Injectable({
    providedIn: "root"
})
export class FileSaver {
    saveBytes(fileName: string, content: any): void {
        const blob = new Blob([content], { type: "application/octet-stream" });
        saveAs(blob, fileName);
    }
}