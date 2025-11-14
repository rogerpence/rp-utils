import { describe, it, expect } from "vitest";
import { Pager } from "../../src/objects";

// Test data interface
interface TestItem {
  id: number;
  name: string;
}

describe("Pager<TestItem>", () => {
  describe("Constructor validation", () => {
    it("should throw TypeError for non-array input", () => {
      // @ts-expect-error - Testing runtime validation
      expect(() => new Pager<TestItem>("not an array", 10)).toThrow(TypeError);
      // @ts-expect-error - Testing runtime validation
      expect(() => new Pager<TestItem>("not an array", 10)).toThrow(
        "arr must be an array",
      );
    });

    it("should throw RangeError for invalid pageSize", () => {
      const items: TestItem[] = [{ id: 1, name: "Item 1" }];

      expect(() => new Pager<TestItem>(items, 0)).toThrow(RangeError);
      expect(() => new Pager<TestItem>(items, 0)).toThrow(
        "pageSize must be a positive integer",
      );
      expect(() => new Pager<TestItem>(items, -5)).toThrow(RangeError);
      expect(() => new Pager<TestItem>(items, 1.5)).toThrow(RangeError);
    });

    it("should create instance with valid inputs", () => {
      const items: TestItem[] = [
        { id: 1, name: "Item 1" },
        { id: 2, name: "Item 2" },
        { id: 3, name: "Item 3" },
      ];
      const pager = new Pager<TestItem>(items, 2);

      expect(pager).toBeInstanceOf(Pager);
      expect(pager.rowCount).toBe(3);
      expect(pager.pageSize).toBe(2);
    });
  });

  describe("Pagination metadata", () => {
    it("should calculate correct pagination metadata", () => {
      const data: TestItem[] = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        name: `Item ${i + 1}`,
      }));
      const pager = new Pager<TestItem>(data, 10);

      expect(pager.totalPages).toBe(3);
      expect(pager.rowCount).toBe(25);
      expect(pager.pageSize).toBe(10);
    });

    it("should handle empty arrays", () => {
      const emptyPager = new Pager<TestItem>([], 10);

      expect(emptyPager.totalPages).toBe(0);
      expect(emptyPager.rowCount).toBe(0);
      expect(emptyPager.getMetadata().isEmpty).toBe(true);
    });

    it("should handle single page", () => {
      const items: TestItem[] = [
        { id: 1, name: "Item 1" },
        { id: 2, name: "Item 2" },
        { id: 3, name: "Item 3" },
      ];
      const pager = new Pager<TestItem>(items, 10);

      expect(pager.totalPages).toBe(1);
      expect(pager.rowCount).toBe(3);
    });
  });

  describe("getRowsForPage", () => {
    const data: TestItem[] = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
    }));
    const pager = new Pager<TestItem>(data, 10);

    it("should return correct first page data", () => {
      const page1 = pager.getRowsForPage(1);

      expect(page1.dataRows).toHaveLength(10);
      expect(page1.dataRows[0]).toEqual({ id: 1, name: "Item 1" });
      expect(page1.dataRows[0].id).toBe(1);
      expect(page1.dataRows[0].name).toBe("Item 1");
      expect(page1.currentPage).toBe(1);
      expect(page1.hasNext).toBe(true);
      expect(page1.hasPrev).toBe(false);
      expect(page1.prevPageNumber).toBe(-1);
      expect(page1.nextPageNumber).toBe(2);
      expect(page1.startIndex).toBe(0);
      expect(page1.endIndex).toBe(9);
    });

    it("should return correct middle page data", () => {
      const page2 = pager.getRowsForPage(2);

      expect(page2.dataRows).toHaveLength(10);
      expect(page2.dataRows[0]).toEqual({ id: 11, name: "Item 11" });
      expect(page2.dataRows[0].id).toBe(11);
      expect(page2.dataRows[0].name).toBe("Item 11");
      expect(page2.currentPage).toBe(2);
      expect(page2.hasNext).toBe(true);
      expect(page2.hasPrev).toBe(true);
      expect(page2.prevPageNumber).toBe(1);
      expect(page2.nextPageNumber).toBe(3);
    });

    it("should return correct last page (partial) data", () => {
      const page3 = pager.getRowsForPage(3);

      expect(page3.dataRows).toHaveLength(5);
      expect(page3.dataRows[0]).toEqual({ id: 21, name: "Item 21" });
      expect(page3.dataRows[0].id).toBe(21);
      expect(page3.dataRows[0].name).toBe("Item 21");
      expect(page3.dataRows[4]).toEqual({ id: 25, name: "Item 25" });
      expect(page3.currentPage).toBe(3);
      expect(page3.hasNext).toBe(false);
      expect(page3.hasPrev).toBe(true);
      expect(page3.nextPageNumber).toBe(-1);
      expect(page3.prevPageNumber).toBe(2);
    });

    it("should throw RangeError for invalid page numbers", () => {
      expect(() => pager.getRowsForPage(0)).toThrow(RangeError);
      expect(() => pager.getRowsForPage(5)).toThrow(RangeError);
      expect(() => pager.getRowsForPage(-1)).toThrow(RangeError);
    });
  });

  describe("Validation methods", () => {
    const items: TestItem[] = [
      { id: 1, name: "Item 1" },
      { id: 2, name: "Item 2" },
      { id: 3, name: "Item 3" },
      { id: 4, name: "Item 4" },
      { id: 5, name: "Item 5" },
    ];
    const pager = new Pager<TestItem>(items, 2);

    it("isValidPage should work correctly", () => {
      expect(pager.isValidPage(1)).toBe(true);
      expect(pager.isValidPage(2)).toBe(true);
      expect(pager.isValidPage(3)).toBe(true);
      expect(pager.isValidPage(0)).toBe(false);
      expect(pager.isValidPage(4)).toBe(false);
      expect(pager.isValidPage(-1)).toBe(false);
    });

    it("hasNextPage should work correctly", () => {
      expect(pager.hasNextPage(1)).toBe(true);
      expect(pager.hasNextPage(2)).toBe(true);
      expect(pager.hasNextPage(3)).toBe(false);
    });

    it("hasPrevPage should work correctly", () => {
      expect(pager.hasPrevPage(1)).toBe(false);
      expect(pager.hasPrevPage(2)).toBe(true);
      expect(pager.hasPrevPage(3)).toBe(true);
    });
  });

  describe("getPageRange", () => {
    const data: TestItem[] = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
    }));
    const pager = new Pager<TestItem>(data, 10);

    it("should return correct page range", () => {
      expect(pager.getPageRange(2, 1)).toEqual([1, 2, 3]);
      expect(pager.getPageRange(5, 2)).toEqual([3, 4, 5, 6, 7]);
    });

    it("should handle edge cases at start", () => {
      expect(pager.getPageRange(1, 2)).toEqual([1, 2, 3]);
    });

    it("should handle edge cases at end", () => {
      expect(pager.getPageRange(10, 2)).toEqual([8, 9, 10]);
    });

    it("should throw for invalid page numbers", () => {
      expect(() => pager.getPageRange(0, 2)).toThrow(RangeError);
      expect(() => pager.getPageRange(11, 2)).toThrow(RangeError);
    });

    it("should throw for invalid range", () => {
      expect(() => pager.getPageRange(5, -1)).toThrow(RangeError);
      expect(() => pager.getPageRange(5, 1.5)).toThrow(RangeError);
    });
  });

  describe("getMetadata", () => {
    it("should return correct metadata for populated array", () => {
      const items: TestItem[] = [
        { id: 1, name: "Item 1" },
        { id: 2, name: "Item 2" },
        { id: 3, name: "Item 3" },
        { id: 4, name: "Item 4" },
        { id: 5, name: "Item 5" },
      ];
      const pager = new Pager<TestItem>(items, 2);
      const metadata = pager.getMetadata();

      expect(metadata.totalItems).toBe(5);
      expect(metadata.pageSize).toBe(2);
      expect(metadata.totalPages).toBe(3);
      expect(metadata.isEmpty).toBe(false);
    });

    it("should return correct metadata for empty array", () => {
      const pager = new Pager<TestItem>([], 10);
      const metadata = pager.getMetadata();

      expect(metadata.totalItems).toBe(0);
      expect(metadata.pageSize).toBe(10);
      expect(metadata.totalPages).toBe(0);
      expect(metadata.isEmpty).toBe(true);
    });
  });

  describe("Immutability", () => {
    it("should create shallow copy (objects shared by reference)", () => {
      const originalData: TestItem[] = [
        { id: 1, name: "First" },
        { id: 2, name: "Second" },
      ];
      const pager = new Pager<TestItem>(originalData, 1);

      // Modify original object property
      originalData[0].id = 999;
      originalData[0].name = "Modified";

      const pageData = pager.getRowsForPage(1);
      expect(pageData.dataRows[0].id).toBe(999);
      expect(pageData.dataRows[0].name).toBe("Modified");
    });

    it("should protect against array modifications", () => {
      const originalData: TestItem[] = [
        { id: 1, name: "First" },
        { id: 2, name: "Second" },
      ];
      const pager = new Pager<TestItem>(originalData, 1);

      // Modify original array
      originalData.push({ id: 3, name: "Third" });

      expect(pager.rowCount).toBe(2);
      expect(pager.totalPages).toBe(2);
    });
  });

  describe("getAllPages", () => {
    it("should return all pages", () => {
      const items: TestItem[] = [
        { id: 1, name: "Item 1" },
        { id: 2, name: "Item 2" },
        { id: 3, name: "Item 3" },
        { id: 4, name: "Item 4" },
        { id: 5, name: "Item 5" },
      ];
      const pager = new Pager<TestItem>(items, 2);
      const allPages = pager.getAllPages();

      expect(allPages).toHaveLength(3);
      expect(allPages[0].dataRows).toEqual([
        { id: 1, name: "Item 1" },
        { id: 2, name: "Item 2" },
      ]);
      expect(allPages[1].dataRows).toEqual([
        { id: 3, name: "Item 3" },
        { id: 4, name: "Item 4" },
      ]);
      expect(allPages[2].dataRows).toEqual([{ id: 5, name: "Item 5" }]);
    });

    it("should return empty array for empty pager", () => {
      const pager = new Pager<TestItem>([], 10);
      const allPages = pager.getAllPages();

      expect(allPages).toHaveLength(0);
    });
  });

  describe("Type safety", () => {
    it("should maintain TestItem type throughout operations", () => {
      const items: TestItem[] = [
        { id: 1, name: "Item 1" },
        { id: 2, name: "Item 2" },
      ];
      const pager = new Pager<TestItem>(items, 1);
      const page = pager.getRowsForPage(1);

      // TypeScript should recognize these properties
      expect(page.dataRows[0].id).toBeDefined();
      expect(page.dataRows[0].name).toBeDefined();
      expect(typeof page.dataRows[0].id).toBe("number");
      expect(typeof page.dataRows[0].name).toBe("string");
    });
  });
});
