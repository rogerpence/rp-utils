import ansis from "ansis";

/**
 * Returns a new array without the last element.
 *
 * @param arr Source array.
 * @returns A shallow copy of the array excluding its final element.
 */
export function removeLastArrayElement<T>(arr: T[]): T[] {
    return arr.slice(0, -1);
}
