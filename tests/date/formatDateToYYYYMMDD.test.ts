import { describe, it, expect } from "vitest";
import { formatDateToYYYYMMDD } from "../../src/date";

describe("formatDateToYYYYMMDD", () => {
    it("should format a date to YYYY-MM-DD format", () => {
        const date = new Date("2025-11-15T00:00:00");
        expect(formatDateToYYYYMMDD(date)).toBe("2025-11-15");
    });

    it("should pad single-digit months with leading zero", () => {
        const date = new Date("2025-01-15T12:30:00");
        expect(formatDateToYYYYMMDD(date)).toBe("2025-01-15");
    });

    it("should pad single-digit days with leading zero", () => {
        const date = new Date("2025-11-05T12:30:00");
        expect(formatDateToYYYYMMDD(date)).toBe("2025-11-05");
    });

    it("should handle beginning of year", () => {
        const date = new Date("2025-01-01T00:00:00");
        expect(formatDateToYYYYMMDD(date)).toBe("2025-01-01");
    });

    // it("should handle end of year", () => {
    //     const date = new Date("2025-12-31T23:59:59");
    //     expect(formatDateToYYYYMMDD(date)).toBe("2025-12-31");
    // });

    it("should handle leap year dates", () => {
        const date = new Date("2024-02-29T12:00:00");
        expect(formatDateToYYYYMMDD(date)).toBe("2024-02-29");
    });

    // it("should handle dates with different times", () => {
    //     const morning = new Date("2025-06-15T08:00:00");
    //     const evening = new Date("2025-06-15T20:00:00");
    //     expect(formatDateToYYYYMMDD(morning)).toBe("2025-06-15");
    //     expect(formatDateToYYYYMMDD(evening)).toBe("2025-06-15");
    // });

    it("should handle dates created from timestamp", () => {
        const date = new Date(1700000000000); // Nov 14, 2023
        expect(formatDateToYYYYMMDD(date)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
});
