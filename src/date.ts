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
            if (dateOnlyPattern.test(value) || dateTimePattern.test(value)) {
                try {
                    // For date-only strings, append time to ensure UTC parsing
                    const dateString = dateOnlyPattern.test(value)
                        ? `${value}T00:00:00`
                        : value;

                    // Convert to Date object
                    const dateValue = new Date(dateString);

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
export const convertDateToStringYYYY_MM_DD = (date: Date): string => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

/**
 * Converts a string in YYYY-MM-DD format to a Date object
 * @param dateString - The date string to parse (must be in YYYY-MM-DD format)
 * @returns A Date object
 * @throws {Error} If the string format is invalid or the date is not valid
 * @example
 * ```typescript
 * const date = parseYYYYMMDDToDate('2025-11-15');
 * Returns Date object for November 15, 2025
 *
 * parseYYYYMMDDToDate('2025-02-30'); // Throws Error: Invalid date
 * parseYYYYMMDDToDate('11-15-2025'); // Throws Error: Invalid format
 * ```
 */
//export const convertYYYYMMDDToDate = (dateString: string): Date => {
export const convertStringYYYY_MM_DDToDate = (dateString: string): Date => {
    // Validate input is a string
    if (typeof dateString !== "string") {
        throw new Error("Input must be a string");
    }

    // Trim whitespace
    const trimmed = dateString.trim();

    // Validate format: YYYY-MM-DD
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(trimmed)) {
        throw new Error(
            `Invalid date format: "${dateString}". Expected format: YYYY-MM-DD`
        );
    }

    // Parse the components
    const [yearStr, monthStr, dayStr] = trimmed.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);

    // Validate ranges
    if (month < 1 || month > 12) {
        throw new Error(
            `Invalid month: ${month}. Month must be between 1 and 12`
        );
    }

    if (day < 1 || day > 31) {
        throw new Error(`Invalid day: ${day}. Day must be between 1 and 31`);
    }

    // Create the date object in UTC at midnight
    const date = new Date(Date.UTC(year, month - 1, day));

    // Verify the date is valid
    if (isNaN(date.getTime())) {
        throw new Error(`Invalid date: "${dateString}"`);
    }

    // Verify the parsed date matches the input (catches invalid dates like Feb 30)
    const parsedYear = date.getUTCFullYear();
    const parsedMonth = date.getUTCMonth() + 1; // getUTCMonth() is 0-indexed
    const parsedDay = date.getUTCDate();

    if (parsedYear !== year || parsedMonth !== month || parsedDay !== day) {
        throw new Error(
            `Invalid date: "${dateString}". Date does not exist in the calendar`
        );
    }

    return date;
};
