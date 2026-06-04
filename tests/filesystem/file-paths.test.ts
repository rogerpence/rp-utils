import { describe, it, expect } from "vitest";
import { getAppPath, getProjectRoot } from "../../src/filesystem";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
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
    });
});
