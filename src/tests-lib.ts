import { fileURLToPath } from "url";
import { getPathForCli } from "../src/filesystem";
import path from "path";
import * as readline from "readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const currentFilePath = process.cwd();

console.log(__filename); // Full path to current file name
console.log(__dirname); // Full dir of current file
console.log(currentFilePath); // Path of current process

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question("Press Enter to continue...", () => {
    console.log("Continuing...");
    rl.close();
});
