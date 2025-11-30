import * as yaml from "js-yaml";

import fs, { promises as fsa } from "fs";
import { getAppPath, getAllDirEntries, writeTextFile } from "./filesystem";
import { convertDateToStringYYYY_MM_DD } from "./date";
import { fileURLToPath } from "url";

import { z } from "zod";
import path from "path";

export interface ParsedMarkdown<
    T extends Record<string, any> = Record<string, any>
> {
    frontMatter: T;
    content: string;
}

// rawFrontMatter?: string;

export type MarkdownFileResult<T> = {
    dirent: fs.Dirent;
    markdownObject: {
        frontMatter: T;
        content: string;
    };
};

export type MarkdownObjectsCollection<T> = {
    filesFound: number;
    filesValid: number;
    collection: MarkdownFileResult<T>[];
};

export type MarkdownObjectsValidtState = {
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
 * @template T - The expected type of the frontmatter object (must extend Record<string, any>)
 * @param {string} folder - Path to the directory containing Markdown files (can be relative or absolute)
 * @returns {Promise<MarkdownFileResult<T>[]>} Array of objects containing file info and parsed Markdown data
 *
 * @example
 * Retrieve all technical notes from a folder
 * const notes = await getMarkdownObjects<TechnicalNoteFrontmatter>('../markdown');
 * console.log(`Found ${notes.length} markdown files`);
 *
 * @example
 * Access individual file information
 * const notes = await getMarkdownObjects<TechnicalNoteFrontmatter>('../markdown');
 * notes.forEach(note => {
 *   console.log(`File: ${note.dirent.name}`);
 *   console.log(`Title: ${note.markdownObject.frontMatter.title}`);
 * });
 */
export async function getMarkdownObjects<T extends Record<string, any>>(
    folder: string
): Promise<MarkdownFileResult<T>[]> {
    const fileInfo: fs.Dirent[] = getAllDirEntries(folder) ?? [];

    const collectionResults = await Promise.all(
        fileInfo.map(async (fi) => {
            const fullFilename = path.join(fi.parentPath, fi.name);

            const markdownObject = await parseMarkdownFile<T>(fullFilename);

            return {
                dirent: fi,
                markdownObject,
            };
        })
    );

    return collectionResults;
}

/**
 * Validates the frontmatter of parsed Markdown objects against a Zod schema.
 *
 * Iterates through a collection of Markdown file results and validates each file's
 * frontmatter against the provided schema. Logs validation errors to console and
 * optionally writes them to a text file for review.
 *
 * @template T - The expected type of the frontmatter object (must extend Record<string, any>)
 * @param {MarkdownFileResult<T>[]} objects - Array of parsed Markdown file results to validate
 * @param {z.ZodSchema<T>} schema - Zod schema to validate frontmatter against
 * @returns {MarkdownObjectsValidtState} Object containing validation statistics and error messages
 *
 * @example
 * Validate markdown objects and check results
 * const markdownObjects = await getMarkdownObjects<TechnicalNoteFrontmatter>('../markdown');
 * const validation = validateMarkdownObjects(markdownObjects, TechnicalNoteFrontmatterSchema);
 *
 * if (validation.filesFound === validation.filesValid) {
 *   console.log('All files valid!');
 * } else {
 *   console.log(`${validation.filesValid}/${validation.filesFound} files are valid`);
 * }
 *
 * @example
 * Handle validation errors
 * const validation = validateMarkdownObjects(objects, schema);
 * if (validation.validationErrors.length > 0) {
 *   console.error('Validation failed. Check error file for details.');
 * }
 */
export function validateMarkdownObjects<T extends Record<string, any>>(
    objects: MarkdownFileResult<T>[],
    schema: z.ZodSchema<T>,
    showErrors: boolean = true
): MarkdownObjectsValidtState {
    const validationErrors: string[] = [];
    const now = new Date();
    validationErrors.push(
        `${convertDateToStringYYYY_MM_DD(now)} ${now.toLocaleTimeString()}`
    );

    let filesFound = objects.length;
    let filesValid = 0;

    objects.map(async (obj) => {
        const result = schema.safeParse(obj.markdownObject.frontMatter);
        // console.jsonString(result);

        if (!result.success) {
            const fullFilename = path.join(obj.dirent.name, obj.dirent.name);
            if (showErrors) {
                console.error(`\n❌ Validation failure: ${obj.dirent.name}`);
                console.error(`File:${fullFilename}`);
                console.error("Errors:");
            }
            result.error.issues.forEach((issue) => {
                //console.warn(` - ${issue.path.join(".")}: ${issue.message}`);
                validationErrors.push(
                    `${fullFilename}  - ${issue.path.join(".")}: ${
                        issue.message
                    }`
                );
            });
        } else {
            filesValid++;
        }
    });

    if (validationErrors.length > 1) {
        const errorFilePath = getAppPath(
            import.meta.url,
            "tests\\test-data\\output"
        );
        writeTextFile(
            validationErrors.join("\n"),
            path.join(errorFilePath, "markdown-validation-errors.txt")
        );
        console.error(`See validate error file: ${errorFilePath}`);
    }

    return {
        filesFound,
        filesValid,
        validationErrors,
    };
}

// /**
//  *
//  * @param folder - top-level markdown folder
//  * @param schema - Zod markdown schema
//  * @return {Promise<MarkdownObjectsCollection<T>>} A promise resolving to an object with:
//  *   - filesFound: Total number of markdown files found
//  *   - filesValid: Number of files that passed schema validation
//  *   - collection: Array of validated markdown file results with dirent and parsed content
//  * @example
//  * ```
//  * import * as z from 'zod';
//  *
//  * export const TechnicalNoteFrontmatterSchema = z
//  *	.object({
//  *		title: z.string(),
//  *		description: z.string(),
//  *		date_created: z.string(),
//  *		date_updated: z.string(),
//  *		date_published: z.string().nullable().optional(),
//  *		pinned: z.boolean(),
//  *		tags: z.array(z.string())
//  *	})
//  *	.strict();
//  *
//  * export type TechnicalNoteFrontmatter = z.infer<typeof TechnicalNoteFrontmatterSchema>;
//  *
//  * const markdownObjects = await getMarkdownCollection<TechnicalNoteFrontmatter>(
//  *	  markdownDirectory,
//  *	  TechnicalNoteFrontmatterSchema
//  * );
//  *```
//  */
// export async function getMarkdownCollection<T extends Record<string, any>>(
//     folder: string,
//     schema: z.ZodSchema<T>
// ): Promise<MarkdownObjectsCollection<T>> {
//     const fileInfo: fs.Dirent[] = getAllDirEntries(folder) ?? [];

//     const validationErrors: string[] = [];
//     const now = new Date();
//     validationErrors.push(
//         `${formatDateToYYYYMMDD(now)} ${now.toLocaleTimeString()}`
//     );

//     const filesFound = fileInfo.length;
//     let filesValid = 0;

//     const collectionResults = await Promise.all(
//         fileInfo.map(async (fi) => {
//             const fullFilename = path.join(fi.parentPath, fi.name);

//             const markdownObject = await parseMarkdownFile<T>(fullFilename);

//             const result = schema.safeParse(markdownObject.frontMatter);

//             if (!result.success) {
//                 console.error(`\n❌ Validation failure: ${fi.name}`);
//                 console.error(`File: ${fullFilename}`);
//                 console.error("Errors:");
//                 result.error.issues.forEach((issue) => {
//                     console.warn(
//                         `  - ${issue.path.join(".")}: ${issue.message}`
//                     );
//                     validationErrors.push(
//                         `${fullFilename}  - ${issue.path.join(".")}: ${
//                             issue.message
//                         }`
//                     );
//                 });
//             } else {
//                 filesValid++;
//                 // console.success('success');
//             }
//             return {
//                 dirent: fi,
//                 markdownObject,
//             };
//         })
//     );

//     if (validationErrors.length > 0) {
//         const errorFilePath = getPathForCli("markdown-validation-errors.txt");
//         writeTextFile(validationErrors.join("\n"), errorFilePath);
//         console.error(`See validate error file: ${errorFilePath}`);
//     }

//     return {
//         filesFound,
//         filesValid,
//         collection: collectionResults,
//     };
// }

/**
 * Parses a markdown file with optional YAML frontmatter
 *
 * Extracts frontmatter delimited by `---` markers at the beginning of the file
 * and parses it as YAML. The remaining content is returned as plain text.
 *
 * @param filename - The path to the markdown file to parse
 * @returns A promise that resolves to a ParsedMarkdown object containing the parsed frontmatter and content
 * @throws {Error} If the file cannot be read or parsing fails
 */
// export const parseMarkdownFile = async (
//   filename: string,
// ): Promise<ParsedMarkdown> => {

export const parseMarkdownFile = async <
    T extends Record<string, any> = Record<string, any>
>(
    filename: string
): Promise<ParsedMarkdown<T>> => {
    try {
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

        // Parse frontMatter YAML
        //let parsedFrontMatter: Record<string, any> = {};
        // Parse frontMatter YAML
        let parsedFrontMatter: T = {} as T;

        const rawFrontMatter = frontMatterLines.join("\n").trim();

        if (rawFrontMatter) {
            try {
                const parsed = yaml.load(rawFrontMatter);
                parsedFrontMatter =
                    parsed && typeof parsed === "object"
                        ? (parsed as T)
                        : ({} as T);
            } catch (yamlError) {
                console.warn(
                    `Warning: Invalid YAML in frontMatter for ${filename}:`,
                    yamlError
                );
                // Return empty object for frontMatter if YAML is invalid
            }
        }

        return {
            frontMatter: parsedFrontMatter as T,
            content: contentLines.join("\n"),
            //rawFrontMatter: rawFrontMatter || undefined,
        };
    } catch (error) {
        throw new Error(`Failed to parse markdown file ${filename}: ${error}`);
    }
};

/**
 * Converts a ParsedMarkdown object to markdown file content and writes it to a file
 * @param parsedMarkdown - The ParsedMarkdown object to convert
 * @param outputFilename - The filename to write the markdown content to
 */
// export const writeMarkdownFile = async (
//   parsedMarkdown: ParsedMarkdown,
//   outputFilename: string,
// ): Promise<void> => {
export const writeMarkdownFile = async <
    T extends Record<string, any> = Record<string, any>
>(
    parsedMarkdown: ParsedMarkdown<T>,
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
