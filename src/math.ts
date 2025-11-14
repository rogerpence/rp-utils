/**
 * Return type for the divMod function containing both division result and modulo.
 */
export type DivMod = {
  /** The quotient (result of integer division) */
  result: number;
  /** The remainder (modulo) */
  mod: number;
};

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
export const divMod = (quotient: number, divisor: number): DivMod => {
  return { result: Math.floor(quotient / divisor), mod: quotient % divisor };
};
