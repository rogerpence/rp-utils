import { describe, it, expect } from "vitest";
import { getFileContents } from "../../src/filesystem";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("test getFileContents", () => {
    describe("successful read", () => {
        it("should show success", () => {
            const filePath = path.join(__dirname, "hello-world.txt");
            const fileContents = getFileContents(filePath);
            expect(fileContents).toBe("Hello, world.");
        });
    });
    describe("file not found", () => {
        it("should throw exception", () => {
            const filePath = path.join(__dirname, "hello-worldxx.txt");
            expect(() => getFileContents(filePath)).toThrow(
                `File does not exist: ${filePath}`
            );
        });
    });
});
