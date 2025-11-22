import { describe, it, expect } from "vitest";

import { getFullPath } from "../getfolder";

import {
    getMarkdownObjects,
    validateMarkdownObjects,
} from "../../src/markdown";

import {
    TechnicalNoteFrontmatterSchema,
    type MarkdownDocument,
    type TechnicalNoteFrontmatter,
} from "../obsidan-types";

describe("get markdown docs", () => {
    describe("read four markdown documents", () => {
        it("should show success", async () => {
            const markdownDataPath = getFullPath(
                "tests\\test-data\\markdown\\all-good"
            );
            const markdownObjects =
                await getMarkdownObjects<TechnicalNoteFrontmatter>(
                    markdownDataPath
                );
            expect(markdownObjects.length).toBe(4);
        });
    });
    describe("read and validate four markdown documents", () => {
        it("should show success", async () => {
            const markdownDataPath = getFullPath(
                "tests\\test-data\\markdown\\all-good"
            );
            const markdownObjects =
                await getMarkdownObjects<TechnicalNoteFrontmatter>(
                    markdownDataPath
                );
            const markdownValidator = validateMarkdownObjects(
                markdownObjects,
                TechnicalNoteFrontmatterSchema
            );

            expect(markdownValidator.filesFound).toBe(4);
            expect(markdownValidator.validationErrors.length).toBe(1);
        });
    });
    describe("read and validate one markdown document", () => {
        it("should show success", async () => {
            const markdownDataPath = getFullPath(
                "tests\\test-data\\markdown\\one-malformed-frontmatter"
            );

            const markdownObjects =
                await getMarkdownObjects<TechnicalNoteFrontmatter>(
                    markdownDataPath
                );

            expect(markdownObjects.length).toBe(1);

            const markdownValidator =
                validateMarkdownObjects<TechnicalNoteFrontmatter>(
                    markdownObjects,
                    TechnicalNoteFrontmatterSchema,
                    false
                );

            expect(markdownValidator.filesFound).toBeGreaterThan(
                markdownValidator.filesValid
            );
        });
    });
});
