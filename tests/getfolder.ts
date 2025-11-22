import { truncatePathAfterDirectory, getPathForCli } from "../src/filesystem";
import path from "path";
import { fileURLToPath } from "url";
import fs, { promises as fsa } from "fs";

export function getFileCurrentDirectory() {
    //const __filename = fileURLToPath(import.meta.url);
    //const __dirname = path.dirname(__filename);
    //const currentFileDir = path.resolve(".");
    //const currentFileDir = fileURLToPath(import.meta.url); //process.cwd();

    const currentFileDir = path.dirname(fileURLToPath(import.meta.url)); //process.cwd();)

    return currentFileDir;
}

/**
 *
 * @param directories
 * @returns
 */

export function getFullPath(directories: string): string {
    const segments = directories.split(/\s*\\\s*/);

    const leadingSegment = segments[0];

    let trailingSegments: string[] = [];
    if (segments.length > 1) {
        trailingSegments = segments.slice(1);
    }

    const leadingDir = truncatePathAfterDirectory(
        getFileCurrentDirectory(),
        leadingSegment
    );

    const resultPath = path.join(leadingDir, ...trailingSegments);
    if (!fs.existsSync(resultPath)) {
        throw new Error(`Created path doesn't exist: ${resultPath}`);
        //console.error(`--->${resultPath} does not exist`);
    }

    return resultPath;
}

//getTestDataPath("roger", "pence");

//console.log(getPathForCli("junk"));
// console.log(getTestDataPath("markdowndd"));
