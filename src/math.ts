import { DivMod } from "./types";

/**
 * Performs division and modulo operations simultaneously.
 *
 * @param quotient - The dividend (number to be divided)
 * @param divisor - The divisor (number to divide by)
 * @returns An object containing both the integer division result and the remainder
 *
 * @example
 * ```ts
 * const result = divMod(17, 5);
 * console.log(result); // { result: 3, mod: 2 }
 * ```
 */
export const divideWithRemainder = (
    quotient: number,
    divisor: number
): DivMod => {
    return {
        quotient: Math.floor(quotient / divisor),
        remainder: quotient % divisor,
    };
};
