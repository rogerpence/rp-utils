import * as yaml from "js-yaml";

import fs, { promises as fsa } from "fs";
import {
    deleteFile,
    getAppPath,
    getAllDirEntries,
    writeTextFile,
} from "./filesystem";
import { convertDateToStringYYYY_MM_DD } from "./date";
import { fileURLToPath } from "url";

import { z } from "zod";
import path from "path";
import { error } from "console";

export interface ParsedMarkdown<
    T extends Record<string, any> = Record<string, any>
> {
    frontMatter: T;
    content: string;
}

// rawFrontMatter?: string;

export type MarkdownObjectsCollection = {
    filesFound: number;
    filesValid: number;
    collection: MarkdownFileResult[];
};

export type MarkdownObjectsValidState = {
    filesFound: number;
    filesValid: number;
    validationErrors: string[];
};

/**
 * Retrieves and parses all Markdown files from a specified directory.
 *
 * Reads all `.md` files in the given folder, parses their frontmatter and content,
 * and returns an array of objects containing both the file system information (Dirent)
 * and the parsed Markdown data.
 *
 * @param {string} folder - Path to the directory containing Markdown files (can be relative or absolute)
 * @returns {Promise<MarkdownParseResult>} Object containing successful and failed parse results
 *
 * @example
 * Retrieve all markdown files from a folder
 * const { successful, failed } = await getMarkdownObjects('../markdown');
 * console.log(`Found ${successful.length} valid files, ${failed.length} failed`);
 *
 * @example
 * Access individual file information
 * const { successful } = await getMarkdownObjects('../markdown');
 * successful.forEach(note => {
 *   console.log(`File: ${note.dirent.name}`);
 *   console.log(`Title: ${note.markdownObject.frontMatter.title}`);
 * });
 */
// export async function getMarkdownObjects2<T extends Record<string, any>>(
//     folder: string
// ): Promise<MarkdownFileResult<T>[]> {
//     const fileInfo: fs.Dirent[] = getAllDirEntries(folder) ?? [];

//     const collectionResults = await Promise.all(
//         fileInfo.map(async (fi) => {
//             const fullFilename = path.join(fi.parentPath, fi.name);

//             const markdownObject = await parseMarkdownFile<T>(fullFilename);

//             return {
//                 dirent: fi,
//                 markdownObject,
//             };
//         })
//     );

//     // console.jsonString(collectionResults);

//     return collectionResults;
// }

export type MarkdownFileResult = {
    dirent: fs.Dirent;
    markdownObject: {
        frontMatter: Record<string, any>;
        content: string;
    };
};

export type MarkdownParseResult = {
    successful: MarkdownFileResult[];
    failed: Array<{
        filename: string;
        dirent: fs.Dirent;
        error: string;
    }>;
};

export async function getMarkdownObjects(
    folder: string
): Promise<MarkdownParseResult> {
    const fileInfo: fs.Dirent[] = getAllDirEntries(folder) ?? [];

    const successful: MarkdownFileResult[] = [];
    const failed: MarkdownParseResult["failed"] = [];

    await Promise.all(
        fileInfo.map(async (fi) => {
            const fullFilename = path.join(fi.parentPath, fi.name);
            const result = await parseMarkdownFile(fullFilename);

            if (result.success) {
                successful.push({
                    dirent: fi,
                    markdownObject: result.data,
                });
            } else {
                failed.push({
                    filename: fullFilename,
                    dirent: fi,
                    error: result.error,
                });
            }
        })
    );

    return { successful, failed };
}

/**
 * Validates the frontmatter of parsed Markdown objects against a Zod schema.
 *
 * Iterates through a collection of Markdown file results and validates each file's
 * frontmatter against the provided schema. Logs validation errors to console and
 * optionally writes them to a text file for review.
 *
 * @template T - The expected type of the validated frontmatter object (enforced by schema)
 * @param {MarkdownFileResult[]} objects - Array of parsed Markdown file results to validate
 * @param {z.ZodSchema<T>} schema - Zod schema to validate frontmatter against
 * @returns {MarkdownObjectsValidState} Object containing validation statistics and error messages
 * ```
 * type MarkdownObjectsValidtState = {
 *       filesFound: number;
 *        filesValid: number;
 *        validationErrors: string[];
 * }
 * ```
};
 * 
 * @example
 * Validate markdown objects and check results
 * ```
 * const markdownObjects = await getMarkdownObjects<TechnicalNoteFrontmatter>('../markdown');
 * const validation = validateMarkdownObjects(markdownObjects, TechnicalNoteFrontmatterSchema);
 * if (validation.filesFound === validation.filesValid) {
 *   console.log('All files valid!');
 * } else {
 *   console.log(`${validation.filesValid}/${validation.filesFound} files are valid`);
 * }
 * ```
 * @example
 * Handle validation errors
 * ```
 * const validation = validateMarkdownObjects(objects, schema);
 * if (validation.validationErrors.length > 0) {
 *   console.error('Validation failed. Check error file for details.');
 * }
 * ```
 */
export function validateMarkdownObjects<T extends Record<string, any>>(
    objects: MarkdownFileResult[],
    schema: z.ZodSchema<T>
): MarkdownObjectsValidState {
    const validationErrors: string[] = [];
    const now = new Date();

    let filesFound = objects.length;
    let filesValid = 0;

    objects.map(async (obj) => {
        const result = schema.safeParse(obj.markdownObject.frontMatter);
        let previousFilename = "";

        if (!result.success) {
            const fullFilename = path.join(
                obj.dirent.parentPath,
                obj.dirent.name
            );
            result.error.issues.forEach((issue) => {
                if (fullFilename != previousFilename) {
                    validationErrors.push(`\nFilename: ${fullFilename}`);
                    previousFilename = fullFilename;
                }
                validationErrors.push(
                    `    Error: ${issue.path.join(".")}: ${issue.message}`
                );
            });
        } else {
            filesValid++;
        }
    });

    if (validationErrors.length > 1) {
        validationErrors.unshift(
            `Frontmatter Validation Errors  ${convertDateToStringYYYY_MM_DD(
                now
            )} ${now.toLocaleTimeString()}`
        );
    }

    return {
        filesFound,
        filesValid,
        validationErrors,
    };
}

export type ParseResult =
    | {
          success: true;
          data: { frontMatter: Record<string, any>; content: string };
      }
    | { success: false; error: string; filename: string };

/**
 * Parses a markdown file with optional YAML frontmatter
 *
 * Extracts frontmatter delimited by `---` markers at the beginning of the file
 * and parses it as YAML. The remaining content is returned as plain text.
 *
 * @param filename - Path to the markdown file to parse
 * @returns A ParseResult with either success (containing frontmatter and content) or failure (containing error message)
 *
 * @example
 * Parse a markdown file
 * ```typescript
 * const result = await parseMarkdownFile('article.md');
 * if (result.success) {
 *   console.log(result.data.frontMatter);
 * } else {
 *   console.error(result.error);
 * }
 * ```
 */
export const parseMarkdownFile = async (
    filename: string
): Promise<ParseResult> => {
    const allFileContents = await fsa.readFile(filename, "utf-8");
    const fileLines = allFileContents.split(/\r?\n/);

    const frontMatterLines: string[] = [];
    const contentLines: string[] = [];

    let frontMatterDelimiterCount = 0;
    let inFrontMatter = false;

    for (const line of fileLines) {
        if (line.trim() === "---") {
            frontMatterDelimiterCount++;
            if (frontMatterDelimiterCount === 1) {
                inFrontMatter = true;
            } else if (frontMatterDelimiterCount === 2) {
                inFrontMatter = false;
            }
            continue;
        }

        if (inFrontMatter) {
            frontMatterLines.push(line);
        } else if (frontMatterDelimiterCount >= 2) {
            contentLines.push(line);
        } else if (frontMatterDelimiterCount === 0) {
            // No frontMatter found, treat everything as content
            contentLines.push(line);
        }
    }

    let parsedFrontMatter: Record<string, any> = {};

    const rawFrontMatter = frontMatterLines.join("\n").trim();

    if (rawFrontMatter) {
        try {
            const parsed = yaml.load(rawFrontMatter);
            parsedFrontMatter =
                parsed && typeof parsed === "object"
                    ? (parsed as Record<string, any>)
                    : {};
            return {
                success: true,
                data: {
                    frontMatter: parsedFrontMatter,
                    content: contentLines.join("\n"),
                },
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
                filename,
            };
        }
    } else {
        return {
            success: false,
            error: "Failed to parse frontmatter",
            filename,
        };
    }
};

/**
 * Converts a ParsedMarkdown object to markdown file content and writes it to a file
 *
 * @param parsedMarkdown - The ParsedMarkdown object to convert
 * @param outputFilename - The filename to write the markdown content to
 * @returns A promise that resolves when the file is written
 *
 * @example
 * Write a markdown file
 * ```typescript
 * const parsed = {
 *   frontMatter: { title: "My Article", date: "2025-12-03" },
 *   content: "# Hello\n\nThis is content."
 * };
 * await writeMarkdownFile(parsed, "output.md");
 * ```
 */
export const writeMarkdownFile = async (
    parsedMarkdown: ParsedMarkdown,
    outputFilename: string
): Promise<void> => {
    try {
        let markdownContent = "";

        // Add frontMatter if it exists and has content
        if (
            parsedMarkdown.frontMatter &&
            Object.keys(parsedMarkdown.frontMatter).length > 0
        ) {
            // Convert frontMatter object back to YAML
            const yamlContent = yaml.dump(parsedMarkdown.frontMatter, {
                indent: 2,
                lineWidth: -1, // Don't wrap lines
                noRefs: true, // Don't use references
                sortKeys: false, // Preserve key order
            });

            markdownContent += "---\n";
            markdownContent += yamlContent;
            markdownContent += "---";
        }

        // Add content if it exists
        if (parsedMarkdown.content) {
            // Add a blank line between frontMatter and content if frontMatter exists
            if (markdownContent) {
                markdownContent += "\n";
            }
            markdownContent += parsedMarkdown.content;
        }

        // Write to file
        await fsa.writeFile(outputFilename, markdownContent, "utf-8");

        console.log(`Successfully wrote markdown file: ${outputFilename}`);
    } catch (error) {
        throw new Error(
            `Failed to write markdown file ${outputFilename}: ${error}`
        );
    }
};
