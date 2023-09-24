import { IField } from "./FileTable";

export interface IFileEditOption {
    fileName: string;
    type: "raw" | "table";
    fields?: IField[];
    process: (array: Uint8Array) => void;
}