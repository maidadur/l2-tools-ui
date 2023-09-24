
export interface IFileTable {
    fields: IField[];
    rows: any[];
}

export interface IField {
    name: string;
    internalName: string;
    isEditable?: boolean;
    isHidden?: boolean;
    fn?: (value: any) => any;
    type: "number" | "color" | "string";
}