import { Injectable } from '@angular/core';
import { deflate, inflate } from "pako";
import { ArrayUtility } from "../utilities/array.utility";
import { ConvertUtility } from "../utilities/convert.utility";
import { MathUtility } from "../utilities/math.utility";

@Injectable({
    providedIn: 'root',
})
export class RSACryptoService {
    constructor(private _mathUtility: MathUtility,
        private _convertUtility: ConvertUtility,
        private _arrayUtility: ArrayUtility) { }

    uIntToBytes(uint: number): Uint8Array {
        const bytes = new Uint8Array(4);
        for (let index = 0; index < bytes.length; index++) {
            var byte = uint & 0xff;
            bytes[index] = byte;
            uint = (uint - byte) / 256;
        }
        return bytes;
    }

    encrypt(content: Uint8Array, n: bigint, e: bigint, header: string): Promise<Uint8Array> {
        return new Promise(resolve => {
            console.log(`${content.length} decrypted file size`);

            const compressedBytes = deflate(content, { level: 6 });
            const size = 124;
            const contentList = new Uint8Array(compressedBytes.length + 4);
            contentList.set(this.uIntToBytes(content.length), 0);
            contentList.set(new Uint8Array(compressedBytes), 4);
            const blocks = Math.floor(contentList.length / size);
            const list = [];

            for (let i = 0; i < blocks; i++) {
                const blockBytes = new Uint8Array(size + 1);
                blockBytes[0] = size;
                blockBytes.set(contentList.subarray(i * size, i * size + size), 1);
                list.push(this._encrypt(blockBytes, e, n));
            }

            const leftOver = contentList.length % size;
            const blockBytes = new Uint8Array(size + 1);
            blockBytes[0] = leftOver;
            blockBytes.set(contentList.subarray(blocks * size, blocks * size + leftOver), size + 1 - leftOver);
            list.push(this._encrypt(blockBytes, e, n));

            const headerBytes = Buffer.from(header, "utf16le");
            list.unshift(headerBytes);

            const buffer = new ArrayBuffer(20);
            const view = new DataView(buffer);

            const crc32Value = this.calculateChecksum(this._arrayUtility.mergeUintArrays(list));
            view.setUint32(0, 0, true);
            view.setUint32(4, 0, true);
            view.setUint32(8, 0, true);
            view.setUint32(12, crc32Value, true);
            view.setUint32(16, 0, true);

            list.push(new Uint8Array(buffer, 0, 20));
            const encryptedBytes = this._arrayUtility.mergeUintArrays(list);
            console.log(`${encryptedBytes.length} encrypted file size`);

            resolve(encryptedBytes);
        });
    }


    private _encrypt(blockBytes: Uint8Array, e: bigint, n: bigint): Uint8Array {
        const blockInt = this._convertUtility.bytesToBigInt(blockBytes);
        const powedVal = this._mathUtility.powermod(blockInt, e, n);
        let hex = powedVal.toString(16);
        while (hex.length != 256) {
            hex = "0" + hex;
        }
        return this._convertUtility.hexStringToBytes(hex);
    }

    decrypt(binaryContent: string, n: bigint, d: bigint): Promise<Uint8Array> {
        return new Promise(resolve => {
            console.log(`${binaryContent.length} encrypted file size`);
            const blocks = Math.floor((binaryContent.length - 28) / 128);
            const encrypted = new Uint8Array(blocks * 128);
            encrypted.set(this._arrayUtility.toUint8Array(binaryContent.substr(28, blocks * 128)));
            const list = [];

            for (let i = 0; i < encrypted.length; i += 128) {
                const blockBytes = new Uint8Array(128);
                blockBytes.set(encrypted.subarray(i, i + 128));

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
            const uncompressedData = inflate(result);

            console.log(`${uncompressedData.length} decrypted file size`);

            resolve(uncompressedData);
        });
    }

    calculateChecksum(bytes: Uint8Array): number {
        const divisor = 0xEDB88320;
        let crc = 0xFFFFFFFF;
        let mask = 0;
        for (const byte of bytes) {
            crc = (crc ^ byte);
            for (let i = 0; i < 8; i++) {
                mask = -(crc & 1);
                crc = (crc >>> 1) ^ (divisor & mask);
            }
        }
        return this.toUnsignedInt32(crc ^ 0xFFFFFFFF);
    };

    toUnsignedInt32(n: number): number {
        if (n >= 0) {
            return n;
        }
        return 0xFFFFFFFF - (n * -1) + 1;
    }
}
