
export class L2BinaryWriter {
    private readonly _data: Uint8Array[] = [];

    getBytes(): Uint8Array[] {
        return this._data;
    }

    writeUint(uint: number): void {
        this.writeBytes([uint & 0xFF, (uint >> 8) & 0xFF, (uint >> 16) & 0xFF, (uint >> 24) & 0xFF]);
    }

    writeHex(hex: string): void {
        hex = hex.replace('#', '');
        const bytes = new Uint8Array(Math.ceil(hex.length / 2));
        for (let c = 0; c < hex.length; c += 2) {
            bytes[c / 2] = parseInt(hex.substring(c, c + 2), 16);
        }
        this._data.push(bytes.reverse());
    }

    writeBytes(arr: number[] | Uint8Array): void {
        this._data.push(new Uint8Array(arr));
    }

    writeString(str: string) {
        if (!str) {
            this.eof();
            return;
        }
        const enc = this.detectEncoding(str);
        if (enc === 'ascii') {
            this._data.push(this.encodeASCFLengthASCII(str.length + 1));
        } else {
            this._data.push(this.encodeASCFLengthUNI(str.length + 1));
        }
        this._data.push(this.encodeStr(str, enc));
        this.eof();
        if (enc !== 'ascii') {
            this.eof();
        }
    }

    encodeASCFLengthASCII(len: number): Uint8Array {
        let n = Math.floor(len / 0x80);
        let b = Math.floor(len / 0x40);
        if (b < 1) {
            return new Uint8Array([len]);
        }
        let a = (len - n * 0x80) | 0x40;

        return new Uint8Array([a, b]);
    }

    encodeASCFLengthUNI(len: number): Uint8Array {
        let n = Math.floor(len / 0x80);
        let b = Math.floor(len / 0x40);
        if (b < 1) {
            return new Uint8Array([0x80 + len]);
        }
        let a = (len - n * 0x80) + ((b % 2 === 0) ? 0xC0 : 0x80);
        return new Uint8Array([a, b]);
    }

    encodeStr(str: string, enc: BufferEncoding): Uint8Array {
        const buffer = Buffer.from(str, enc);
        return new Uint8Array(buffer);
    }

    eof(): void {
        this._data.push(new Uint8Array([0]));
    }

    detectEncoding(str: string): BufferEncoding {
        const bufferUTF16 = Buffer.from(str, 'ucs2');
        const bufferUTF8 = Buffer.from(str, 'ascii');
        if (bufferUTF16.filter(x => x !== 0).length === bufferUTF8.filter(x => x !== 0).length) {
            return 'ascii';
        }
        return 'ucs2';
    }
}