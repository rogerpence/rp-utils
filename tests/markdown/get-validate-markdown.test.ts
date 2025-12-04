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

describe("converting markdown to objects", () => {
    const errorFilePath = getAppPath(
        import.meta.url,
        "tests\\test-data\\output"
    );

    const fullErrorFilename = path.join(
        errorFilePath,
        "markdown-validation-errors.txt"
    );

    describe("when four files all have parseable frontmatter", () => {
        it("should fetch four TechnicalNoteFrontmatter objects", async () => {
            const markdownDataPath = getAppPath(
                import.meta.url,
                "tests\\test-data\\markdown\\all-good"
            );
            const { successful, failed } = await getMarkdownObjects(
                markdownDataPath
            );

            expect(successful.length).toBe(4);
        });
    });

    describe("when four files have parseable and typesafe frontmatter", () => {
        it("should fetch four TechnicalNoteFrontmatter objects and four ", async () => {
            const markdownDataPath = getAppPath(
                import.meta.url,
                "tests\\test-data\\markdown\\all-good"
            );

            const { successful: markdownObjects, failed } =
                await getMarkdownObjects(markdownDataPath);

            expect(markdownObjects.length).toBe(4);

            const markdownValidator = validateMarkdownObjects(
                markdownObjects,
                TechnicalNoteFrontmatterSchema
            );

            expect(markdownValidator.filesFound).toBe(4);
            expect(markdownValidator.validationErrors.length).toBe(0);
        });
    });

    describe("read four markdown documents--one of which has a frontmatter error", () => {
        deleteFile(fullErrorFilename);

        it("should show success", async () => {
            const markdownDataPath = getAppPath(
                import.meta.url,
                "tests\\test-data\\markdown\\one-bad"
            );
            const { successful: markdownObjects, failed } =
                await getMarkdownObjects(markdownDataPath);

            expect(markdownObjects.length).toBe(4);

            const markdownValidator =
                validateMarkdownObjects<TechnicalNoteFrontmatter>(
                    markdownObjects,
                    TechnicalNoteFrontmatterSchema
                );

            expect(markdownValidator.filesValid).toBeLessThan(
                markdownValidator.filesFound
            );

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

            const { successful: markdownObjects, failed } =
                await getMarkdownObjects(markdownDataPath);

            expect(markdownObjects.length).toBe(1);

            const markdownValidator = validateMarkdownObjects(
                markdownObjects,
                TechnicalNoteFrontmatterSchema
            );

            // const markdownValidator =
            //     validateMarkdownObjects<TechnicalNoteFrontmatter>(
            //         markdownObjects,
            //         TechnicalNoteFrontmatterSchema
            //     );

            expect(markdownValidator.filesFound).toBeGreaterThan(
                markdownValidator.filesValid
            );
        });
    });
});
