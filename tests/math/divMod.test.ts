import { describe, it, expect } from "vitest";
import { divMod } from "../../src/math";

describe("divMod", () => {
  describe("Basic functionality", () => {
    it("should return correct quotient and remainder for positive numbers", () => {
      const result = divMod(17, 5);

      expect(result.result).toBe(3);
      expect(result.mod).toBe(2);
    });

    it("should handle even division with no remainder", () => {
      const result = divMod(20, 5);

      expect(result.result).toBe(4);
      expect(result.mod).toBe(0);
    });

    it("should handle dividend smaller than divisor", () => {
      const result = divMod(3, 5);

      expect(result.result).toBe(0);
      expect(result.mod).toBe(3);
    });

    it("should handle division by 1", () => {
      const result = divMod(42, 1);

      expect(result.result).toBe(42);
      expect(result.mod).toBe(0);
    });
  });

  describe("Edge cases", () => {
    it("should handle zero dividend", () => {
      const result = divMod(0, 5);

      expect(result.result).toBe(0);
      expect(result.mod).toBe(0);
    });

    it("should handle large numbers", () => {
      const result = divMod(1000000, 7);

      expect(result.result).toBe(142857);
      expect(result.mod).toBe(1);
    });

    it("should handle negative dividend", () => {
      const result = divMod(-17, 5);

      expect(result.result).toBe(-4);
      expect(result.mod).toBe(-2);
    });

    it("should handle negative divisor", () => {
      const result = divMod(17, -5);

      expect(result.result).toBe(-4);
      expect(result.mod).toBe(2);
    });

    it("should handle both negative numbers", () => {
      const result = divMod(-17, -5);

      expect(result.result).toBe(3);
      expect(result.mod).toBe(-2);
    });
  });

  describe("Return type", () => {
    it("should return object with result and mod properties", () => {
      const result = divMod(10, 3);

      expect(result).toHaveProperty("result");
      expect(result).toHaveProperty("mod");
      expect(typeof result.result).toBe("number");
      expect(typeof result.mod).toBe("number");
    });
  });
});
