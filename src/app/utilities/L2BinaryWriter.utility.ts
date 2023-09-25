
export class L2BinaryWriter {
    private readonly _data: Uint8Array[] = [];
    private readonly _utf8TextEncoder = new TextEncoder();

    getBytes(): Uint8Array[] {
        return this._data;
    }

    writeUint(uint: number): void {
        const bytes = new Uint8Array(4);
        for (let index = 0; index < bytes.length; index++) {
            var byte = uint & 0xff;
            bytes[index] = byte;
            uint = (uint - byte) / 256;
        }
        this._data.push(bytes);
    }

    writeHex(hex: string): void {
        const bytes = new Uint8Array(Math.ceil(hex.length / 2));
        for (let c = 0; c < hex.length; c += 2) {
            bytes[c / 2] = parseInt(hex.substr(c, 2), 16);
        }
        this._data.push(bytes);
    }

    writeBytes(arr: number[]): void {
        this._data.push(new Uint8Array(arr));
    }

    writeString(str: string) {
        const enc = this.detectEncoding(str);
        if (enc === 'utf-8') {
            this._data.push(this.encodeASCFLengthUTF(str.length));
            this._data.push(this._utf8TextEncoder.encode(str));
        } else {
            this._data.push(this.encodeASCFLengthUNICODE(str.length));
            this._data.push(this.encodeUnicode(str));
        }
        this.eof();
    }

    encodeASCFLengthUTF(len: number): Uint8Array {
        let n = Math.floor(len / 0x80);
        let b = Math.floor(len / 0x40);
        if (b < 1) {
            return new Uint8Array([len]);
        }
        let a = (len - n * 0x80) | 0x40;

        return new Uint8Array([a, b]);
    }

    encodeASCFLengthUNICODE(len: number): Uint8Array {
        let n = Math.floor(len / 0x80);
        let b = Math.floor(len / 0x40);
        if (b < 1) {
            return new Uint8Array(0x80 + len);
        }
        let a = (len - n * 0x80) + ((b % 2 === 0) ? 0xC0 : 0x80);
        return new Uint8Array([a, b]);
    }

    encodeUnicode(str: string): Uint8Array {
        const buffer = Buffer.from(str, 'utf16le');
        const bytes = new Uint8Array(buffer.length);
        for (var i = 0; i < buffer.length; i++) {
            bytes[i] = buffer[i];
        }
        return bytes;
    }

    eof(): void {
        this._data.push(new Uint8Array([0]));
    }

    detectEncoding(str: string): string {
        const encoder = new TextEncoder();
        const decoder = new TextDecoder('utf-8');

        // Encode and then decode the string with the current encoding
        const encodedString = encoder.encode(str);
        const decodedString = decoder.decode(encodedString);

        // Check if the decoded string matches the original
        if (decodedString === str) {
            return 'utf-8';
        }
        return 'utf16le';
    }
}