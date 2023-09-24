import { Injectable } from '@angular/core';
import { gzip, ungzip } from "pako";
import { ArrayUtility } from "../utilities/array.utility";
import { ConvertUtility } from "../utilities/convert.utility";
import { MathUtility } from "../utilities/math.utility";

@Injectable({
    providedIn: 'root',
})
export class RSACryptoService {
    private _textEncoder = new TextEncoder();

    constructor(private _mathUtility: MathUtility,
        private _convertUtility: ConvertUtility,
        private _arrayUtility: ArrayUtility) { }

    encrypt(content: string, n: bigint, e: bigint, header: string): Promise<Uint8Array> {
        return new Promise(resolve => {
            const rawBytes = this._textEncoder.encode(content);
            const contentBytes = gzip(rawBytes);
            const contentList = new Uint8Array(contentBytes.length + 4);
            contentList.set(new Uint8Array(contentBytes), 4);

            const list = [];

            let size = 124;
            let commonSize = 0;
            while (contentBytes.length > commonSize) {
                const blockBytes = new Uint8Array(size + 1);
                blockBytes[0] = size;
                blockBytes.set(contentBytes.subarray(commonSize, commonSize + size), 1);

                const blockInt = this._convertUtility.bytesToBigInt(blockBytes);
                const powedVal = this._mathUtility.powermod(blockInt, e, n);

                const hex = powedVal.toString(16);
                const powerValBytes = this._convertUtility.hexStringToBytes(hex);
                list.push(powerValBytes);
                commonSize += size;
                size = Math.min(contentBytes.length - commonSize, 124);
            }

            const headerBytes = this._textEncoder.encode(header);
            list.unshift(headerBytes);

            resolve(this._arrayUtility.mergeUintArrays(list));
        });
    }

    decrypt(fileBytes: string, n: bigint, d: bigint): Promise<Uint8Array> {
        return new Promise(resolve => {
            const blocks = Math.floor((fileBytes.length - 28) / 128);
            const encrypted = new Uint8Array(blocks * 128);
            encrypted.set(this._arrayUtility.toUint8Array(fileBytes.substr(28, blocks * 128)));
            const list = [];

            for (let i = 0; i < blocks; i++) {
                const blockBytes = new Uint8Array(128);
                blockBytes.set(encrypted.subarray(i * 128, i * 128 + 128));

                const blockInt = this._convertUtility.bytesToBigInt(blockBytes);
                const powedVal = this._mathUtility.powermod(blockInt, d, n);

                const hex = powedVal.toString(16);
                const powerValBytes = this._convertUtility.hexStringToBytes(hex);

                const size = powerValBytes[0];
                if (size > powerValBytes.length - 1) {
                    throw new Error("Size is greater than the length of the string.");
                }

                let resultArray;
                if (size !== 124) {
                    let p = powerValBytes.length - size;
                    while (p > 2 && powerValBytes[p - 1] !== 0) {
                        p--;
                    }
                    resultArray = powerValBytes.slice(p, p + size);
                } else {
                    resultArray = powerValBytes.slice(-size);
                }

                list.push(resultArray);
            }
            const result = this._arrayUtility.mergeUintArrays(list).slice(4);

            const uncompressedData = ungzip(result);

            resolve(uncompressedData);
        });
    }
}
