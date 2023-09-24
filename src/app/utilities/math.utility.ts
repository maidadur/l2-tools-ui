import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root',
})
export class MathUtility {
    powermod(base: bigint, exp: bigint, p: bigint): bigint {
        let result = 1n;
        while (exp !== 0n) {
            if (exp % 2n === 1n) result = result * base % p;
            base = base * base % p;
            exp >>= 1n;
        }
        return result;
    }
}