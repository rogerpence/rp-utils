/**
 * Converts date-like string values in a Frontmatter object to Date objects
 * Supports patterns: YYYY-MM-DD and YYYY-MM-DD HH:MM
 * @param obj - The object to process
 * @returns A new object with date strings converted to Date objects
 */
export const convertFrontmatterDateStrings = <T extends Record<string, any>>(
    obj: T
): T => {
    // Regular expressions for the two date patterns
    const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
    const dateTimePattern = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;

    // Create a shallow copy of the object to avoid mutating the original
    const result = { ...obj };

    for (const [key, value] of Object.entries(result)) {
        // Only process string values
        if (typeof value === "string") {
            // Check if the string matches either pattern
            // console.log(`replacement: ${value}`);
            if (dateOnlyPattern.test(value) || dateTimePattern.test(value)) {
                try {
                    // Convert to Date object
                    const dateValue = new Date(value);

                    // Check if the date is valid
                    if (isNaN(dateValue.getTime())) {
                        throw new Error(`Invalid date: ${value}`);
                    }

                    // Replace the string value with the Date object
                    (result as any)[key] = dateValue;
                } catch (error) {
                    console.warn(
                        `Failed to parse date for key "${key}" with value "${value}":`,
                        error
                    );
                    // Continue processing other keys - don't modify this value
                }
            }
        }
    }

    return result;
};

/**
 * Converts a Date object to a string in the format yyyy-mm-dd
 * @param date - The Date object to format
 * @returns A string in yyyy-mm-dd format
 * @example
 * ```typescript
 * const date = new Date('2025-11-15T12:30:00');
 * formatDateToYYYYMMDD(date); // Returns "2025-11-15"
 * ```
 */
export const formatDateToYYYYMMDD = (date: Date): string => {
    return date.toLocaleDateString("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
};
