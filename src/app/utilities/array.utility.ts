import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root',
})
export class ArrayUtility {

    mergeUintArrays(arrays: Uint8Array[]): Uint8Array {
        let length = 0;
        arrays.forEach(item => {
            length += item.length;
        });

        // Create a new array with total length and merge all source arrays.
        let mergedArray = new Uint8Array(length);
        let offset = 0;
        arrays.forEach(item => {
            mergedArray.set(item, offset);
            offset += item.length;
        });
        return mergedArray;
    }

    toUint8Array(array: string): Uint8Array {
        let uintArray = new Uint8Array(array.length);

        for (let i = 0; i < array.length; i++) {
            uintArray[i] = array[i].charCodeAt(0);
        }
        return uintArray;
    }

    toBinaryStringArray(array: Uint8Array): string {
        let str = '';

        for (let i = 0; i < array.length; i++) {
            str += String.fromCharCode(array[i]);
        }
        return str;
    }
}