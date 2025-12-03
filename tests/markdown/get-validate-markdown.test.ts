import { describe, it, expect } from "vitest";
import path from "path";

import { getAppPath, deleteFile, writeTextFile } from "../../src/filesystem";

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
    const errorFilePath = getAppPath(
        import.meta.url,
        "tests\\test-data\\output"
    );

    const fullErrorFilename = path.join(
        errorFilePath,
        "markdown-validation-errors.txt"
    );

    describe("get-objects-from-all-good", () => {
        it("should show success", async () => {
            const markdownDataPath = getAppPath(
                import.meta.url,
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
            const markdownDataPath = getAppPath(
                import.meta.url,
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
            expect(markdownValidator.validationErrors.length).toBe(0);
            writeTextFile(
                markdownValidator.validationErrors.join("\n"),
                fullErrorFilename
            );
        });
    });

    describe("read four markdown documents--one of which has a frontmatter error", () => {
        deleteFile(fullErrorFilename);

        it("should show success", async () => {
            const markdownDataPath = getAppPath(
                import.meta.url,
                "tests\\test-data\\markdown\\one-bad"
            );
            const markdownObjects =
                await getMarkdownObjects<TechnicalNoteFrontmatter>(
                    markdownDataPath
                );
            expect(markdownObjects.length).toBe(4);

            const markdownValidator =
                validateMarkdownObjects<TechnicalNoteFrontmatter>(
                    markdownObjects,
                    TechnicalNoteFrontmatterSchema,
                    false
                );

            expect(markdownValidator.filesValid).toBe(3);
            expect(markdownValidator.filesFound).toBe(4);

            if (markdownValidator.validationErrors.length > 1) {
                writeTextFile(
                    markdownValidator.validationErrors.join("\n"),
                    fullErrorFilename
                );
            }
        });
    });

    describe("read and validate one markdown document", () => {
        const x = import.meta.url;

        it("should show success 3", async () => {
            const markdownDataPath = getAppPath(
                import.meta.url,
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
