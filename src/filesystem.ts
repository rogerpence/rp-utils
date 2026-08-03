import "./console";
import { fileURLToPath } from "url";
import path from "path";
import fs, { promises as fsa } from "fs";
import { WriteObjectToFileOptions } from "./types";

/**
 * Runtime enum-like map of supported path classifications.
 *
 * Use these values for comparisons at runtime (for example,
 * `kind === PathKind.Absolute`).
 */
export const PathKind = Object.freeze({
    Empty: "empty",
    Absolute: "absolute",
    FilenameOnly: "filename-only",
    Relative: "relative",
} as const);

/**
 * Union type of all supported path classification values.
 *
 * This type is derived from {@link PathKind} so runtime values and
 * compile-time types stay in sync.
 */
export type PathKind = (typeof PathKind)[keyof typeof PathKind];

/**
 * Checks if a file exists at the specified path.
 *
 * @param filePath - The path to the file to check
 * @returns A promise that resolves to true if the file exists, false otherwise
 *
 * @example
 * Check if a file exists:
 * ```typescript
 * const exists = await existsFile('path/to/file.txt');
 * if (exists) {
 *   console.log('File found!');
 * }
 * ```
 *
 * @example
 * Use in conditional logic:
 * ```typescript
 * if (await existsFile(errorFilePath)) {
 *   await fsa.rm(errorFilePath);
 * }
 * ```
 */
export async function existsFile(filePath: string): Promise<boolean> {
    try {
        await fsa.access(filePath);
        return true;
    } catch {
        return false;
    }
}

/**
 * Deletes a file from the filesystem if it exists.
 *
 * @param filePath - The path to the file to delete
 * @returns A promise that resolves when the file is deleted or doesn't exist
 *
 * @remarks
 * This function silently succeeds if the file doesn't exist (no error is thrown).
 * If the file exists but cannot be deleted due to permissions or other errors,
 * the error is logged to the console but the function completes normally.
 *
 * @example
 * Delete a file:
 * ```typescript
 * await deleteFile('path/to/file.txt');
 * console.log('File deleted or did not exist');
 * ```
 *
 * @example
 * Delete a validation errors file:
 * ```typescript
 * const errorFilePath = path.join(
 *     getAppPath(import.meta.url, "tests\\test-data\\output"),
 *     "markdown-validation-errors.txt"
 * );
 * await deleteFile(errorFilePath);
 * ```
 */
export async function deleteFile(filePath: string): Promise<boolean> {
    if (await existsFile(filePath)) {
        try {
            await fsa.rm(filePath);
            return true;
        } catch (error) {
            return false;
        }
    }

    return false;
}

/**
 * Retrieves directory entries for all files and subdirectories in a directory
 *
 * Returns an array of fs.Dirent objects which include file names and types
 * (file, directory, symbolic link, etc.) without additional filesystem stat information.
 *
 * @param targetDirectory - The path to the directory to read
 * @returns An array of fs.Dirent objects, or undefined if the directory doesn't exist or an error occurs
 */
export const getDirEntries = (
    targetDirectory: string,
): fs.Dirent[] | undefined => {
    try {
        // Check if directory exists synchronously
        if (!fs.existsSync(targetDirectory)) {
            console.log(`Directory does not exist: ${targetDirectory}`);
            return undefined;
        }

        // withFileNames: true causes array of Dirent's to be returned.
        const filenames: fs.Dirent[] = fs.readdirSync(targetDirectory, {
            withFileTypes: true,
        });
        return filenames;
    } catch (error) {
        console.log(error);
        return undefined;
    }
};

/**
 * Recursively retrieves all file entries (not directories) for a directory tree
 *
 * Traverses the entire directory structure starting from targetDirectory,
 * returning fs.Dirent objects for all files found (excludes directories).
 *
 * @param targetDirectory - The path to the root directory to start traversal
 * @returns An array of fs.Dirent objects for files only, or undefined if an error occurs
 */
export const getAllDirEntries = (
    targetDirectory: string,
): fs.Dirent[] | undefined => {
    try {
        // Check if directory exists
        if (!fs.existsSync(targetDirectory)) {
            console.log(`Directory does not exist: ${targetDirectory}`);
            return undefined;
        }

        const allEntries = new Set<fs.Dirent>();

        // Read entries in current directory
        const entries = fs.readdirSync(targetDirectory, {
            withFileTypes: true,
        });

        for (const entry of entries) {
            // If it's a directory, recursively get its file entries
            if (entry.isDirectory()) {
                const fullPath = path.join(
                    entry.parentPath || targetDirectory,
                    entry.name,
                );
                const subEntries = getAllDirEntries(fullPath);

                if (subEntries) {
                    subEntries.forEach((subEntry) => allEntries.add(subEntry));
                }
            } else if (entry.isFile()) {
                // Only add file entries (not directories)
                allEntries.add(entry);
            }
        }

        return Array.from(allEntries);
    } catch (error) {
        console.log(error);
        return undefined;
    }
};

/**
 * Get get contents of a text file.
 * @param filePath - fully-qualified file name.
 *
 * @returns file contents
 *
 */
export const getFileContents = (filePath: string): string => {
    if (!fs.existsSync(filePath)) {
        throw new Error(`File does not exist: ${filePath}`);
    }

    const fileContents = fs.readFileSync(filePath, {
        encoding: "utf8",
        flag: "r",
    });

    return fileContents;
};

/**
 * Get the project root path.
 * @param filePath - The fully path of a TypeScript file. Can either a File URL or simple full path.
 * @returns The file's project root.
 *
 * @remarks
 * This function is for use only for CLI use in the dev
 * environment. It will not work in a serverless deployment
 * environment.
 *
 */
export function getProjectRoot(filePath: string): string {
    if (filePath.startsWith("file:")) {
        filePath = fileURLToPath(filePath);
    }
    const __dirname = path.dirname(filePath);

    // Find package.json by going up the directory tree
    let currentPath = __dirname;
    while (currentPath !== path.parse(currentPath).root) {
        if (fs.existsSync(path.join(currentPath, "package.json"))) {
            return currentPath;
        }
        currentPath = path.dirname(currentPath);
    }
    throw new Error("Could not find project root");
}

/**
 * Get a path appeneded to the project root. This function makes it easy to get a file path inside a project for CLI work (mostly to read and write to JSON and markdown files). It dispenses with worrying about `../../` nonsense.
 *
 * This function is for use specifically for CLI work. It does not work on serverless environments.
 * @param filePath - The fully path of a TypeScript file. Can either a File URL or simple full path.
 * @param additionalPath - The desired path fragment off of the root.
 * @param fileName - Optional file name to append to the end of the path.
 * @returns A path from the project root.
 * @remarks
 * _IMPORTANT NOTE:_ This function is for use only for CLI use in the dev
 * environment. It will not work in a serverless deployment
 * environment.
 * @example
 * ```
 * const markdownDataPath = getFullPath(
 *       import.meta.url,
 *       "tests\\test-data\\markdown"
 * )
 * ```
 * or
 * ```
 * const markdownDataPath = getFullPath(
 *       "C:\\Users\\thumb\\Documents\\projects\\typescript\\utils\\src\\markdown.ts"
 *       "tests\\test-data\\markdown"
 * )
 * ```
 * If the `filePath` is
 * ```
 * "C:\\Users\\thumb\\Documents\\projects\\typescript\\utils"
 * ```
 * and the `additionalPath` is:
 * ```
 * "tests\\test-data\\markdown"
 * ```
 * The result is:
 * ```
 * "C:\\Users\\thumb\\Documents\\projects\\typescript\\utils\\tests\\test-data\\markdown"
 * ```
 *
 */
export function getAppPath(
    filePath: string,
    additionalPath: string,
    fileName?: string,
): string {
    const projectRoot = getProjectRoot(filePath);

    const segments = additionalPath.split(/\s*\\\s*/);

    let resultPath = path.join(projectRoot, ...segments);

    if (!fs.existsSync(resultPath)) {
        throw new Error(`Path doesn't exist: ${resultPath}`);
    }

    if (fileName) {
        resultPath = path.join(resultPath, fileName);
    }

    return resultPath;
}

/**
 *
 * @param fullPath
 * @param lastDirectory
 * @returns 'fullPath' value truncated after 'lastDirectory'
 * @example
 * ```
 * truncatePathAfterDirectory(`c:\\one\\two\\three\\test.json`, 'two')
 * ```
 * returns `c:\\one\\two`
 *
 * @remarks An error occurs and processing stops if 'fullPath' doesn't
 * include the 'lastDirectory' folder.
 */
export function getTruncatedPath(
    fullPath: string,
    lastDirectory: string,
): string {
    const parts = fullPath.split(path.sep);

    const srcIndex = parts.indexOf(lastDirectory);
    if (srcIndex === -1) {
        console.error(`Path doesn't contain the '${lastDirectory}' directory`);
        process.exit(1);
    }
    return parts.slice(0, srcIndex + 1).join(path.sep);
}

/**
 * Writes a JavaScript object to a JSON file.
 *
 * @param {string} filePath - The path where the JSON file will be written
 * @param {unknown} object - The object to serialize and write to the file
 * @param {WriteObjectToFileOptions} [options] - Optional configuration.
 * @param {string} [options.exportName] - Names the array when creating a TypeScript file.
 * @param {boolean} [options.compressed=false] - If true, writes minified JSON without whitespace
 * @param {boolean} [options.log=true] - If true, logs success message to console
 * @returns {void}
 *
 * @throws {Error} If the file cannot be written or the object cannot be serialized
 *
 * @example
 * Write with default options (formatted, logged):
 *   writeObjectToFile('data.json', myObject);
 *
 * @example
 * Write compressed without logging:
 *   writeObjectToFile('data.json', myObject, { compressed: true, log: false });
 *
 * @example
 * Write with custom name for logging:
 *   writeObjectToFile('index.json', indexObjects, { objectName: 'indexObjects' });
 */
export function writeObjectToFile(
    object: unknown,
    filePath: string,
    options?: WriteObjectToFileOptions,
): void {
    const { compressed = false, log = false } = options ?? {};

    let dir: string = "";

    try {
        // Ensure target directory exists
        const filePathClass = classifyFilePath(filePath);

        if (filePathClass == PathKind.Absolute) {
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) {
                console.error(`writeObjectToFile error:  ${dir} not found`);
                process.exit(1);
            }
        }

        if (filePath.endsWith(".json") && options?.exportName) {
            console.error(
                `writeObjectToFile error:  Cannot not write to .json file with export name`,
            );
            process.exit(1);
        }

        if (
            filePath.endsWith(".js") ||
            (filePath.endsWith(".ts") && !options?.exportName)
        ) {
            console.error(
                `writeObjectToFile error:  Must provide an export name for a .js`,
            );
            process.exit(1);
        }

        const exportedName = options?.exportName
            ? `export const ${options?.exportName} = `
            : "";

        const importLine = options?.importLine
            ? `${options?.importLine}\n\n `
            : "";

        // Serialize with appropriate formatting
        const json = compressed
            ? JSON.stringify(object)
            : JSON.stringify(object, null, 4);

        // Write to file
        fs.writeFileSync(
            filePath,
            `${importLine}${exportedName}${json}`,
            "utf-8",
        );

        // Optional logging
        if (log) {
            console.success(`✓ Wrote ${filePath}`);
        }
    } catch (error) {
        console.error(`Failed to write file ${filePath}:`, error);
        throw error;
    }
}

/**
 * Overwrite a file with new contents (synchronously).
 *
 * @param text
 * @param filename -- fully-qualified output file name.
 * @returns void
 */
export function writeTextFile(text: string, filename: string): void {
    fs.writeFileSync(`${filename}`, text);
}

/**
 * Classifies a file path string as empty, absolute, filename-only, or relative.
 *
 * Classification rules:
 * - empty: blank or whitespace-only input
 * - absolute: OS-absolute paths, including Windows drive and UNC forms
 * - filename-only: contains no path separators
 * - relative: non-empty path containing separators that is not absolute
 *
 * @param filePath Path string to classify.
 * @returns A {@link PathKind} value describing the input path shape.
 */
export function classifyFilePath(filePath: string): PathKind {
    const p = filePath.trim();
    if (!p) return "empty";

    // Absolute path on current OS
    if (path.isAbsolute(p)) return "absolute";

    // Optional: catch Windows drive-rooted forms even if running on non-Windows
    if (/^[a-zA-Z]:[\\/]/.test(p) || /^\\\\[^\\]+\\[^\\]+/.test(p)) {
        return "absolute";
    }

    // If no slash characters, it is just a file name
    const hasSeparators = /[\\/]/.test(p);
    if (!hasSeparators) return "filename-only";

    // Otherwise it's a relative path
    return "relative";
}

/**
 * Determines whether a path points to a file.
 *
 * Returns false when the path does not exist or cannot be accessed.
 *
 * @param fullPath Fully qualified path to check.
 * @returns True when the path exists and is a file; otherwise false.
 */
export async function isFilename(fullPath: string): Promise<boolean> {
    try {
        const stats = await fsa.stat(fullPath);
        return stats.isFile();
    } catch {
        return false;
    }
}

/**
 * Recursively collects fully qualified file paths from a folder and its
 * subfolders, optionally filtering by file extension.
 *
 * The input folder is resolved relative to this module's directory.
 *
 * @param relativePath Path to the target folder, relative to this file.
 * @param extension Optional extension suffix used by glob filtering
 * (for example, ".md"). Defaults to an empty string (no filter).
 * @returns A list of absolute file paths for entries that are files.
 * @throws {Error} If the resolved target folder does not exist.
 */
export async function getAllFilenames(
    relativePath: string,
    extension: string = "",
): Promise<string[]> {
    const targetDirectory = path.resolve(process.cwd(), relativePath);

    console.log("target directory", targetDirectory);

    if (!fs.existsSync(targetDirectory)) {
        throw new Error(`Path not found: ${relativePath}`);
    }

    const result: string[] = [];

    for await (const relativeEntryPath of fsa.glob(`**/*${extension}`, {
        cwd: targetDirectory,
    })) {
        const potentialFilename = path.join(targetDirectory, relativeEntryPath);
        if (await isFilename(potentialFilename)) {
            result.push(potentialFilename);
        }
    }

    return result;
}
