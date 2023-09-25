import { IField } from "./FileTable";

export interface IFileEditOption {
    fileName: string;
    type: "raw" | "table";
    fields?: IField[];
    parse: (arr: Uint8Array) => void;
    compress: () => Uint8Array;
}