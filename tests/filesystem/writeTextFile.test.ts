import { describe, it, expect } from "vitest";
import { getFileContents, writeTextFile } from "../../src/filesystem";
import { fileURLToPath } from "url";
import path from "path";
const fs = require("fs");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("test writeFileContents", () => {
    describe("successful write", () => {
        it("should show success", () => {
            const filePath = path.join(__dirname, "test-output.txt");

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            const contents = "this is the file contents";
            writeTextFile(contents, filePath);

            expect(fs.existsSync(filePath)).toBeTruthy();

            const freshFileContents = getFileContents(filePath);
            expect(freshFileContents).toBe(contents);
        });
    });
});
