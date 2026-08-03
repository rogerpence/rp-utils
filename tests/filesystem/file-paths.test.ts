import { describe, it, expect } from "vitest";
import {
    getAllFilenames,
    getAppPath,
    getProjectRoot,
} from "../../src/filesystem";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
// const fs = require("fs");

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("test file path stuff", () => {
    describe("getProjectRoot", () => {
        it("should show success", () => {
            let root = getProjectRoot(fileURLToPath(import.meta.url));
            expect(root).toBe(
                "C:\\Users\\thumb\\Documents\\projects\\typescript\\utils",
            );

            root = getProjectRoot(import.meta.url);
            expect(root).toBe(
                "C:\\Users\\thumb\\Documents\\projects\\typescript\\utils",
            );

            let appPath = getAppPath(fileURLToPath(import.meta.url), "tests");
            expect(appPath).toBe(
                "C:\\Users\\thumb\\Documents\\projects\\typescript\\utils\\tests",
            );

            appPath = getAppPath(
                fileURLToPath(import.meta.url),
                "tests",
                "testfile.json",
            );
            expect(appPath).toBe(
                "C:\\Users\\thumb\\Documents\\projects\\typescript\\utils\\tests\\testfile.json",
            );
        });

        it("resolves relative paths from the current working directory", async () => {
            const originalCwd = process.cwd();

            try {
                process.chdir(join(__dirname, "..", ".."));
                const filenames = await getAllFilenames("tests/test-data");
                expect(filenames.length).toBeGreaterThan(0);
            } finally {
                process.chdir(originalCwd);
            }
        });
    });
});
