import { describe, it, expect } from "vitest";
import { divideWithRemainder } from "../../src/math";

describe("divideWithRemainder", () => {
    describe("Basic functionality", () => {
        it("should return correct quotient and remainder for positive numbers", () => {
            const quotient = divideWithRemainder(17, 5);

            expect(quotient.quotient).toBe(3);
            expect(quotient.remainder).toBe(2);
        });

        it("should handle even division with no remainder", () => {
            const quotient = divideWithRemainder(20, 5);

            expect(quotient.quotient).toBe(4);
            expect(quotient.remainder).toBe(0);
        });

        it("should handle dividend smaller than divisor", () => {
            const quotient = divideWithRemainder(3, 5);

            expect(quotient.quotient).toBe(0);
            expect(quotient.remainder).toBe(3);
        });

        it("should handle division by 1", () => {
            const quotient = divideWithRemainder(42, 4);

            expect(quotient.quotient).toBe(10);
            expect(quotient.remainder).toBe(2);
        });
    });

    describe("Edge cases", () => {
        it("should handle zero dividend", () => {
            const quotient = divideWithRemainder(0, 5);

            expect(quotient.quotient).toBe(0);
            expect(quotient.remainder).toBe(0);
        });

        it("should handle large numbers", () => {
            const quotient = divideWithRemainder(1000000, 7);

            expect(quotient.quotient).toBe(142857);
            expect(quotient.remainder).toBe(1);
        });

        it("should handle negative dividend", () => {
            const quotient = divideWithRemainder(-17, 5);

            expect(quotient.quotient).toBe(-4);
            expect(quotient.remainder).toBe(-2);
        });

        it("should handle negative divisor", () => {
            const quotient = divideWithRemainder(17, -5);

            expect(quotient.quotient).toBe(-4);
            expect(quotient.remainder).toBe(2);
        });

        it("should handle both negative numbers", () => {
            const quotient = divideWithRemainder(-17, -5);

            expect(quotient.quotient).toBe(3);
            expect(quotient.remainder).toBe(-2);
        });
    });

    describe("Return type", () => {
        it("should return object with quotient and remainder properties", () => {
            const quotient = divideWithRemainder(10, 3);

            expect(quotient).toHaveProperty("quotient");
            expect(quotient).toHaveProperty("remainder");
            expect(typeof quotient.quotient).toBe("number");
            expect(typeof quotient.remainder).toBe("number");
        });
    });
});
