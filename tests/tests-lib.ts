import { fileURLToPath } from "url";
//import { getPathForCli } from "../src/filesystem";
import path from "path";

export function getFileCurrentDirectory() {
    //const __filename = fileURLToPath(import.meta.url);
    //const __dirname = path.dirname(__filename);
    const currentFileDir = path.resolve(".");

    return currentFileDir;
}

export function truncatePathAfterDirectory(
    fullPath: string,
    lastDirectory: string
): string {
    const parts = fullPath.split(path.sep);

    const srcIndex = parts.indexOf(lastDirectory);
    if (srcIndex === -1) {
        console.error(`Path doesn't contain the '${lastDirectory}' directory`);
        process.exit(1);
    }
    return parts.slice(0, srcIndex + 1).join(path.sep);
}

export function getPathForCli(
    initialDirectory: string,
    ...segments: string[]
): string {
    // Regardless of where this source file is located, results
    // are always under SvelteKit's 'src' folder.

    const currentFilePath = fileURLToPath(import.meta.url); //process.cwd();
    console.log(currentFilePath);

    if (!currentFilePath.includes(initialDirectory)) {
        console.error(`The ${initialDirectory} is not in ${currentFilePath}`);
    }

    const srcPath = truncatePathAfterDirectory(
        currentFilePath,
        initialDirectory
    );

    if (initialDirectory === "src" && segments.length == 0) {
        segments = ["lib", "data"];
    }

    return path.join(srcPath, ...segments);
}

const p = getPathForCli("tests");
console.log(p);

//

//

//
//const __filename = fileURLToPath(import.meta.url);
//
const __dirname = path.dirname(__filename);
//

//
const currentFilePath = process.cwd();
//

//
//console.log(__filename);
// console.log(__dirname);
// console.log(currentFilePath);
//
