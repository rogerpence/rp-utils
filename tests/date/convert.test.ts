import { afterAll, describe, it, expect, vi } from "vitest";
import { convertFrontmatterDateStrings } from "../../src/date";

describe("convertFrontmatterDateStrings", () => {
    it("should convert YYYY-MM-DD strings to Date objects", () => {
        const input = {
            title: "My Post",
            publishDate: "2025-11-15",
            otherField: "some value",
        };

        const result = convertFrontmatterDateStrings(input);

        expect(result.publishDate).toBeInstanceOf(Date);
        expect((result.publishDate as unknown as Date).toISOString()).toContain(
            "2025-11-15"
        );
        // Ensure other fields remain untouched
        expect(result.title).toBe("My Post");
    });

    it("should convert YYYY-MM-DD HH:MM strings to Date objects", () => {
        const input = {
            eventStart: "2025-11-15 14:30",
        };

        const result = convertFrontmatterDateStrings(input);

        expect(result.eventStart).toBeInstanceOf(Date);
        const date = result.eventStart as unknown as Date;
        expect(date.getFullYear()).toBe(2025);
        expect(date.getMonth()).toBe(10); // 0-indexed (Nov)
        expect(date.getDate()).toBe(15);
    });

    it("should not modify non-date strings", () => {
        const input = {
            name: "John Doe",
            description: "2025-11-15 is a date in text", // Contains date but isn't exact match
            version: "1.0.0",
        };

        const result = convertFrontmatterDateStrings(input);

        expect(typeof result.name).toBe("string");
        expect(typeof result.description).toBe("string");
        expect(result.description).toBe("2025-11-15 is a date in text");
    });

    it("should not modify non-string values", () => {
        const input = {
            count: 42,
            isValid: true,
            tags: ["a", "b"],
            nested: { date: "2025-01-01" }, // Function is shallow, won't touch nested
        };

        const result = convertFrontmatterDateStrings(input);

        expect(result.count).toBe(42);
        expect(result.isValid).toBe(true);
        expect(Array.isArray(result.tags)).toBe(true);
        // Verify shallow behavior
        expect(typeof result.nested.date).toBe("string");
    });

    it("should handle invalid dates gracefully by leaving them as strings", () => {
        const input = {
            badDate: "2025-99-99", // Matches regex pattern but invalid date
        };

        // Mock console.warn to keep test output clean
        const consoleMock = vi
            .spyOn(console, "warn")
            .mockImplementation(() => {});

        const result = convertFrontmatterDateStrings(input);

        expect(typeof result.badDate).toBe("string");
        expect(result.badDate).toBe("2025-99-99");
        expect(consoleMock).toHaveBeenCalled();

        afterAll(() => {
            consoleMock.mockReset(); // Reset the mock after all tests in this suite
        });

        // consoleSpy.mockRestore();
    });

    it("should convert YYYY-MM-DD strings to Date objects", () => {
        const input = {
            title: "My Post",
            publishDate: "2025-11-15",
            otherField: "some value",
        };

        const result = convertFrontmatterDateStrings(input);

        expect(result.publishDate).toBeInstanceOf(Date);
        expect((result.publishDate as unknown as Date).toISOString()).toContain(
            "2025-11-15"
        );
        // Ensure other fields remain untouched
        expect(result.title).toBe("My Post");
    });

    it("should convert YYYY-MM-DD HH:MM strings to Date objects", () => {
        const input = {
            eventStart: "2025-11-15 14:30",
        };

        const result = convertFrontmatterDateStrings(input);

        expect(result.eventStart).toBeInstanceOf(Date);
        const date = result.eventStart as unknown as Date;
        expect(date.getFullYear()).toBe(2025);
        expect(date.getMonth()).toBe(10); // 0-indexed (Nov)
        expect(date.getDate()).toBe(15);
    });

    it("should not modify non-date strings", () => {
        const input = {
            name: "John Doe",
            description: "2025-11-15 is a date in text", // Contains date but isn't exact match
            version: "1.0.0",
        };

        const result = convertFrontmatterDateStrings(input);

        expect(typeof result.name).toBe("string");
        expect(typeof result.description).toBe("string");
        expect(result.description).toBe("2025-11-15 is a date in text");
    });

    it("should not modify non-string values", () => {
        const input = {
            count: 42,
            isValid: true,
            tags: ["a", "b"],
            nested: { date: "2025-01-01" }, // Function is shallow, won't touch nested
        };

        const result = convertFrontmatterDateStrings(input);

        expect(result.count).toBe(42);
        expect(result.isValid).toBe(true);
        expect(Array.isArray(result.tags)).toBe(true);
        // Verify shallow behavior
        expect(typeof result.nested.date).toBe("string");
    });

    it("should return a new object (immutability)", () => {
        const input = { date: "2025-01-01" };
        const result = convertFrontmatterDateStrings(input);

        expect(result).not.toBe(input); // References should differ
        expect(typeof input.date).toBe("string"); // Original should be unchanged
        expect(result.date).toBeInstanceOf(Date); // Result should be changed
    });
});
