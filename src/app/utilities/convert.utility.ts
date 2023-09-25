import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root',
})
export class ConvertUtility {

    bytesToBigInt(bytes: Uint8Array): bigint {
        const hexString = this.bytesToHex(bytes);
        // Remove any spaces or other unwanted characters from the hex string
        const sanitizedHexString = hexString.replace(/ /g, "");

        // Check if the string has an odd length, and if so, add a leading '0'
        const paddedHexString = sanitizedHexString.length % 2 !== 0 ? `0${sanitizedHexString}` : sanitizedHexString;

        // Parse the hex string as a BigInteger
        return BigInt("0x" + paddedHexString);
    }

    bytesToHex(bytes: Uint8Array): string {
        return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    }

    hexStringToBytes(hex: string): Uint8Array {
        let sanitizedHex = hex.replace(/ /g, "");

        if (sanitizedHex.length % 2 !== 0) {
            sanitizedHex = "0" + sanitizedHex;
        }

        const byteArray = new Uint8Array(sanitizedHex.length / 2);
        for (let i = 0; i < sanitizedHex.length; i += 2) {
            byteArray[i / 2] = parseInt(sanitizedHex.substring(i, i + 2), 16);
        }
        return byteArray;
    }
}