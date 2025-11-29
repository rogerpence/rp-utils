import { describe, it, expect } from "vitest";
import { getFullPath, getProjectRoot } from "../../src/filesystem";
import { fileURLToPath } from "url";
import path from "path";
const fs = require("fs");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("test file path stuff", () => {
    describe("getProjectRoot", () => {
        it("should show success", () => {
            let root = getProjectRoot(fileURLToPath(import.meta.url));
            expect(root).toBe(
                "C:\\Users\\thumb\\Documents\\projects\\typescript\\utils"
            );

            root = getProjectRoot(import.meta.url);
            expect(root).toBe(
                "C:\\Users\\thumb\\Documents\\projects\\typescript\\utils"
            );

            const path = getFullPath(fileURLToPath(import.meta.url), "tests");
            expect(path).toBe(
                "C:\\Users\\thumb\\Documents\\projects\\typescript\\utils\\tests"
            );
        });
    });
});
