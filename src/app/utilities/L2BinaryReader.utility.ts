export class L2BinaryReaderUtility {
    private _offset: number = 0;
    private readonly _bytes: Uint8Array;
    private readonly _utf8TextEncoder = new TextDecoder('utf-8');
    private readonly _utf16TextEncoder = new TextDecoder('utf-16');

    constructor(bytes: Uint8Array) {
        this._bytes = bytes;
    }

    parseUInt(): number {
        const intVal = new Uint8Array(4);
        for (let i = 0; i < 4; i++) {
            intVal[i] = this._bytes[this._offset + i];
        }
        this._offset += 4;
        return new DataView(intVal.buffer).getUint32(0, true);
    }

    parseByteToHex(): string {
        return this.parseByte().toString(16).padStart(2, "0");
    }

    parseByte(): number {
        this._offset++;
        return this._bytes[this._offset - 1];
    }

    parseString(): string {
        if (this._bytes.length <= this._offset + 1)
            throw new Error(`Can't read ASCF! Unexpected EOF at ${this._offset + 1}`);

        const a = this._bytes[this._offset];
        const b = this._bytes[this._offset + 1];
        let response = "";
        if (a >= 0x80 && a < 0xC0) {
            const len = a & ~0x80;

            const start = this._offset + 1;
            if (start + len * 2 + 1 >= this._bytes.length)
                throw new Error(`Can't read ASCF! Unexpected EOF at ${start}`);

            this._offset += 1 + len * 2;

            const utf16Bytes = new Uint8Array(len * 2);
            for (let i = 0; i < len * 2; i++) {
                utf16Bytes[i] = this._bytes[start + i];
            }
            response = this._utf16TextEncoder.decode(utf16Bytes);
        } else if (a >= 0xC0 && a <= 0xFF) {
            const n = (b - (b % 2)) / 2;
            const len = ((a & ~((b % 2 === 0) ? 0xC0 : 0x80)) + (n * 0x80));

            const start = this._offset + 2;
            if (start + len * 2 + 2 >= this._bytes.length)
                throw new Error(`Can't read ASCF! Unexpected EOF at ${start}`);

            this._offset += 2 + len * 2;

            const utf16Bytes = new Uint8Array(len * 2);
            for (let i = 0; i < len * 2; i++) {
                utf16Bytes[i] = this._bytes[start + i];
            }
            response = this._utf16TextEncoder.decode(utf16Bytes);
        } else if (a < 0x40) {
            if (this._offset + 1 + a >= this._bytes.length)
                throw new Error(`Can't read ASCF! Unexpected EOF at ${this._offset + 1}`);

            response = this._utf8TextEncoder.decode(this._bytes.slice(this._offset + 1, this._offset + 1 + a));
            this._offset += 1 + a;
        } else if (a >= 0x40) {
            const n = (b - (b % 2)) / 2;
            const len = ((a & ~((b % 2 === 0) ? 0xC0 : 0x80)) + (n * 0x80));

            if (this._offset + 2 + len >= this._bytes.length)
                throw new Error(`Can't read ASCF! Unexpected EOF at ${this._offset + 2}`);

            response = this._utf8TextEncoder.decode(this._bytes.slice(this._offset + 2, this._offset + 2 + len));
            this._offset += 2 + len;
        }

        return response.slice(0, -1);
    }
}