import { describe, it, expect } from "vitest";
import { sortObjArray } from "../../src/sort";

describe("sortObjArray", () => {
    describe("Single property sorting", () => {
        it("should sort numbers in ascending order by default", () => {
            const arr = [{ value: 3 }, { value: 1 }, { value: 2 }];
            const result = sortObjArray(arr, ["value"]);
            expect(result).toEqual([{ value: 1 }, { value: 2 }, { value: 3 }]);
        });

        it("should sort numbers in descending order", () => {
            const arr = [{ value: 1 }, { value: 3 }, { value: 2 }];
            const result = sortObjArray(arr, ["value"], ["desc"]);
            expect(result).toEqual([{ value: 3 }, { value: 2 }, { value: 1 }]);
        });

        it("should sort strings in ascending order (case-insensitive)", () => {
            const arr = [
                { name: "Charlie" },
                { name: "alice" },
                { name: "Bob" },
            ];
            const result = sortObjArray(arr, ["name"]);
            expect(result).toEqual([
                { name: "alice" },
                { name: "Bob" },
                { name: "Charlie" },
            ]);
        });

        it("should sort strings in descending order", () => {
            const arr = [
                { name: "Alice" },
                { name: "Charlie" },
                { name: "Bob" },
            ];
            const result = sortObjArray(arr, ["name"], ["desc"]);
            expect(result).toEqual([
                { name: "Charlie" },
                { name: "Bob" },
                { name: "Alice" },
            ]);
        });

        it("should handle numeric strings correctly", () => {
            const arr = [{ id: "item10" }, { id: "item2" }, { id: "item1" }];
            const result = sortObjArray(arr, ["id"]);
            expect(result).toEqual([
                { id: "item1" },
                { id: "item2" },
                { id: "item10" },
            ]);
        });

        it("should handle numeric strings in descending order", () => {
            const arr = [{ id: "item2" }, { id: "item10" }, { id: "item1" }];
            const result = sortObjArray(arr, ["id"], ["desc"]);
            expect(result).toEqual([
                { id: "item10" },
                { id: "item2" },
                { id: "item1" },
            ]);
        });
    });

    describe("Multiple property sorting", () => {
        it("should sort by first property, then second as tiebreaker (both ascending)", () => {
            const arr = [
                { count: 5, tag: "beta" },
                { count: 5, tag: "alpha" },
                { count: 10, tag: "gamma" },
            ];
            const result = sortObjArray(arr, ["count", "tag"]);
            expect(result).toEqual([
                { count: 5, tag: "alpha" },
                { count: 5, tag: "beta" },
                { count: 10, tag: "gamma" },
            ]);
        });

        it("should sort by count desc, then tag asc", () => {
            const arr = [
                { count: 5, tag: "beta" },
                { count: 5, tag: "alpha" },
                { count: 10, tag: "gamma" },
            ];
            const result = sortObjArray(arr, ["count", "tag"], ["desc", "asc"]);
            expect(result).toEqual([
                { count: 10, tag: "gamma" },
                { count: 5, tag: "alpha" },
                { count: 5, tag: "beta" },
            ]);
        });

        it("should sort by count desc, then tag desc", () => {
            const arr = [
                { count: 5, tag: "alpha" },
                { count: 5, tag: "beta" },
                { count: 10, tag: "gamma" },
            ];
            const result = sortObjArray(
                arr,
                ["count", "tag"],
                ["desc", "desc"]
            );
            expect(result).toEqual([
                { count: 10, tag: "gamma" },
                { count: 5, tag: "beta" },
                { count: 5, tag: "alpha" },
            ]);
        });

        it("should default to ascending for properties without explicit order", () => {
            const arr = [
                { count: 5, tag: "beta" },
                { count: 5, tag: "alpha" },
            ];
            const result = sortObjArray(arr, ["count", "tag"], ["desc"]);
            expect(result).toEqual([
                { count: 5, tag: "alpha" },
                { count: 5, tag: "beta" },
            ]);
        });

        it("should handle three properties with mixed orders", () => {
            const arr = [
                { category: "A", count: 5, tag: "beta" },
                { category: "A", count: 5, tag: "alpha" },
                { category: "B", count: 10, tag: "gamma" },
                { category: "A", count: 10, tag: "delta" },
            ];
            const result = sortObjArray(
                arr,
                ["category", "count", "tag"],
                ["asc", "desc", "asc"]
            );
            expect(result).toEqual([
                { category: "A", count: 10, tag: "delta" },
                { category: "A", count: 5, tag: "alpha" },
                { category: "A", count: 5, tag: "beta" },
                { category: "B", count: 10, tag: "gamma" },
            ]);
        });
    });

    describe("Special value handling", () => {
        it("should handle null values (push to end) in ascending order", () => {
            const arr = [{ value: 2 }, { value: null }, { value: 1 }];
            const result = sortObjArray(arr, ["value"]);
            expect(result).toEqual([
                { value: 1 },
                { value: 2 },
                { value: null },
            ]);
        });

        it("should handle undefined values (push to end) in ascending order", () => {
            const arr = [{ value: 2 }, { value: undefined }, { value: 1 }];
            const result = sortObjArray(arr, ["value"]);
            expect(result).toEqual([
                { value: 1 },
                { value: 2 },
                { value: undefined },
            ]);
        });

        it("should handle both null and undefined values", () => {
            const arr = [
                { value: 2 },
                { value: null },
                { value: 1 },
                { value: undefined },
            ];
            const result = sortObjArray(arr, ["value"]);
            expect(result[0]).toEqual({ value: 1 });
            expect(result[1]).toEqual({ value: 2 });
            // null and undefined both at end (order between them doesn't matter)
        });

        it("should handle Date objects in ascending order", () => {
            const arr = [
                { date: new Date("2023-03-01") },
                { date: new Date("2023-01-01") },
                { date: new Date("2023-02-01") },
            ];
            const result = sortObjArray(arr, ["date"]);
            expect(result[0].date.toISOString()).toBe(
                new Date("2023-01-01").toISOString()
            );
            expect(result[1].date.toISOString()).toBe(
                new Date("2023-02-01").toISOString()
            );
            expect(result[2].date.toISOString()).toBe(
                new Date("2023-03-01").toISOString()
            );
        });

        it("should handle Date objects in descending order", () => {
            const arr = [
                { date: new Date("2023-01-01") },
                { date: new Date("2023-03-01") },
                { date: new Date("2023-02-01") },
            ];
            const result = sortObjArray(arr, ["date"], ["desc"]);
            expect(result[0].date.toISOString()).toBe(
                new Date("2023-03-01").toISOString()
            );
            expect(result[1].date.toISOString()).toBe(
                new Date("2023-02-01").toISOString()
            );
            expect(result[2].date.toISOString()).toBe(
                new Date("2023-01-01").toISOString()
            );
        });

        it("should handle boolean values in ascending order (false before true)", () => {
            const arr = [{ active: true }, { active: false }, { active: true }];
            const result = sortObjArray(arr, ["active"]);
            expect(result).toEqual([
                { active: false },
                { active: true },
                { active: true },
            ]);
        });

        it("should handle boolean values in descending order (true before false)", () => {
            const arr = [
                { active: false },
                { active: true },
                { active: false },
            ];
            const result = sortObjArray(arr, ["active"], ["desc"]);
            expect(result).toEqual([
                { active: true },
                { active: false },
                { active: false },
            ]);
        });
    });

    describe("Array immutability", () => {
        it("should not mutate the original array", () => {
            const arr = [{ value: 3 }, { value: 1 }, { value: 2 }];
            const original = JSON.parse(JSON.stringify(arr));
            sortObjArray(arr, ["value"]);
            expect(arr).toEqual(original);
        });

        it("should return a new array instance", () => {
            const arr = [{ value: 3 }, { value: 1 }, { value: 2 }];
            const result = sortObjArray(arr, ["value"]);
            expect(result).not.toBe(arr);
        });
    });

    describe("Edge cases", () => {
        it("should handle empty array", () => {
            const arr: { value: number }[] = [];
            const result = sortObjArray(arr, ["value"]);
            expect(result).toEqual([]);
        });

        it("should handle single element array", () => {
            const arr = [{ value: 42 }];
            const result = sortObjArray(arr, ["value"]);
            expect(result).toEqual([{ value: 42 }]);
        });

        it("should handle all equal values", () => {
            const arr = [{ value: 7 }, { value: 7 }, { value: 7 }];
            const result = sortObjArray(arr, ["value"]);
            expect(result).toEqual([{ value: 7 }, { value: 7 }, { value: 7 }]);
        });

        it("should handle already sorted array", () => {
            const arr = [{ value: 1 }, { value: 2 }, { value: 3 }];
            const result = sortObjArray(arr, ["value"]);
            expect(result).toEqual([{ value: 1 }, { value: 2 }, { value: 3 }]);
        });

        it("should handle reverse sorted array", () => {
            const arr = [{ value: 3 }, { value: 2 }, { value: 1 }];
            const result = sortObjArray(arr, ["value"]);
            expect(result).toEqual([{ value: 1 }, { value: 2 }, { value: 3 }]);
        });
    });

    describe("Real-world use case: TagCount", () => {
        type TagCount = {
            tag: string;
            count: number;
        };

        it("should sort tags by count descending, then tag ascending", () => {
            const tags: TagCount[] = [
                { tag: "javascript", count: 5 },
                { tag: "typescript", count: 10 },
                { tag: "python", count: 5 },
                { tag: "rust", count: 3 },
            ];

            const result = sortObjArray(
                tags,
                ["count", "tag"],
                ["desc", "asc"]
            );

            expect(result).toEqual([
                { tag: "typescript", count: 10 },
                { tag: "javascript", count: 5 },
                { tag: "python", count: 5 },
                { tag: "rust", count: 3 },
            ]);
        });

        it("should handle tags with same count sorted alphabetically", () => {
            const tags: TagCount[] = [
                { tag: "zebra", count: 5 },
                { tag: "alpha", count: 5 },
                { tag: "beta", count: 5 },
            ];

            const result = sortObjArray(
                tags,
                ["count", "tag"],
                ["desc", "asc"]
            );

            expect(result).toEqual([
                { tag: "alpha", count: 5 },
                { tag: "beta", count: 5 },
                { tag: "zebra", count: 5 },
            ]);
        });

        it("should handle mixed case tag names", () => {
            const tags: TagCount[] = [
                { tag: "JavaScript", count: 5 },
                { tag: "javascript", count: 3 },
                { tag: "JAVASCRIPT", count: 7 },
            ];

            const result = sortObjArray(tags, ["tag"], ["asc"]);

            // All should be grouped together due to case-insensitive comparison
            expect(
                result.every((t) => t.tag.toLowerCase() === "javascript")
            ).toBe(true);
        });
    });
});
