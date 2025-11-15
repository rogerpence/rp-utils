import { describe, it, expect } from "vitest";
import { formatDateToYYYYMMDD, convertYYYYMMDDToDate } from "../../src/date";

describe("parseYYYYMMDDToDate", () => {
    it("should parse a valid YYYY-MM-DD string to Date", () => {
        const date = convertYYYYMMDDToDate("2025-11-15");
        expect(date).toBeInstanceOf(Date);
        expect(date.getUTCFullYear()).toBe(2025);
        expect(date.getUTCMonth()).toBe(10); // 0-indexed
        expect(date.getUTCDate()).toBe(15);
    });

    it("should handle dates with leading zeros", () => {
        const date = convertYYYYMMDDToDate("2025-01-05");
        expect(date.getUTCFullYear()).toBe(2025);
        expect(date.getUTCMonth()).toBe(0);
        expect(date.getUTCDate()).toBe(5);
    });

    it("should handle leap year dates", () => {
        const date = convertYYYYMMDDToDate("2024-02-29");
        expect(date.getUTCFullYear()).toBe(2024);
        expect(date.getUTCMonth()).toBe(1);
        expect(date.getUTCDate()).toBe(29);
    });

    it("should throw error for invalid leap year date", () => {
        expect(() => convertYYYYMMDDToDate("2023-02-29")).toThrow(
            "Invalid date"
        );
    });

    it("should throw error for invalid date format", () => {
        expect(() => convertYYYYMMDDToDate("11-15-2025")).toThrow(
            "Invalid date format"
        );
        expect(() => convertYYYYMMDDToDate("2025/11/15")).toThrow(
            "Invalid date format"
        );
        expect(() => convertYYYYMMDDToDate("2025-11-15 12:30")).toThrow(
            "Invalid date format"
        );
    });

    it("should throw error for invalid month", () => {
        expect(() => convertYYYYMMDDToDate("2025-13-15")).toThrow(
            "Invalid month"
        );
        expect(() => convertYYYYMMDDToDate("2025-00-15")).toThrow(
            "Invalid month"
        );
    });

    it("should throw error for invalid day", () => {
        expect(() => convertYYYYMMDDToDate("2025-11-32")).toThrow(
            "Invalid day"
        );
        expect(() => convertYYYYMMDDToDate("2025-11-00")).toThrow(
            "Invalid day"
        );
    });

    it("should throw error for non-existent dates", () => {
        expect(() => convertYYYYMMDDToDate("2025-02-30")).toThrow(
            "Date does not exist"
        );
        expect(() => convertYYYYMMDDToDate("2025-04-31")).toThrow(
            "Date does not exist"
        );
    });

    it("should throw error for non-string input", () => {
        expect(() => convertYYYYMMDDToDate(null as any)).toThrow(
            "Input must be a string"
        );
        expect(() => convertYYYYMMDDToDate(12345 as any)).toThrow(
            "Input must be a string"
        );
    });

    it("should handle strings with whitespace", () => {
        const date = convertYYYYMMDDToDate("  2025-11-15  ");
        expect(date.getUTCFullYear()).toBe(2025);
        expect(date.getUTCMonth()).toBe(10);
        expect(date.getUTCDate()).toBe(15);
    });

    it("should round-trip with formatDateToYYYYMMDD", () => {
        const original = "2025-11-15";
        const date = convertYYYYMMDDToDate(original);
        queueMicrotask;
        const formatted = formatDateToYYYYMMDD(date);
        expect(formatted).toBe(original);

        // Verify UTC components directly
        expect(date.getUTCFullYear()).toBe(2025);
        expect(date.getUTCMonth()).toBe(10);
        expect(date.getUTCDate()).toBe(15);
    });
});
