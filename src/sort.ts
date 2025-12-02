/**
 * Sorts an array of objects by one or more properties with configurable sort order.
 *
 * @template T - The type of objects in the array
 * @param {T[]} arr - The array to sort
 * @param {(keyof T)[]} props - Array of property names to sort by (in priority order)
 * @param {('asc' | 'desc')[]} [orders] - Optional sort order for each property ('asc' or 'desc'). Defaults to 'asc'
 * @returns {T[]} The sorted array
 *
 * @example
 * Sort by count descending, then tag ascending
 * ```
 * sortObjArray(tags, ['count', 'tag'], ['desc', 'asc']);
 * ```
 *
 * @example
 * Sort by count descending (default order for other props is asc)
 * ```
 * sortObjArray(tags, ['count', 'tag'], ['desc']);
 * ```
 */
export const sortObjArray = <T extends Record<string, any>>(
    arr: T[],
    props: (keyof T)[],
    orders: ("asc" | "desc")[] = []
): T[] => {
    return [...arr].sort((a, b) => {
        for (let i = 0; i < props.length; i++) {
            const prop = props[i];
            const order = orders[i] || "asc";
            const multiplier = order === "desc" ? -1 : 1;

            let comparison = 0;
            const aVal = a[prop] as unknown;
            const bVal = b[prop] as unknown;

            // Handle null/undefined
            if (aVal == null && bVal == null) {
                comparison = 0;
            } else if (aVal == null) {
                comparison = 1;
            } else if (bVal == null) {
                comparison = -1;
            }
            // Number comparison
            else if (typeof aVal === "number" && typeof bVal === "number") {
                comparison = aVal - bVal;
            }
            // Date comparison
            else if (aVal instanceof Date && bVal instanceof Date) {
                comparison = aVal.getTime() - bVal.getTime();
            }
            // Boolean comparison
            else if (typeof aVal === "boolean" && typeof bVal === "boolean") {
                comparison = aVal === bVal ? 0 : aVal ? 1 : -1;
            }
            // String comparison (case-insensitive)
            else {
                comparison = String(aVal).localeCompare(
                    String(bVal),
                    undefined,
                    {
                        sensitivity: "base",
                        numeric: true, // Handles "2" vs "10" correctly
                    }
                );
            }

            if (comparison !== 0) {
                return comparison * multiplier;
            }
        }
        return 0;
    });
};
