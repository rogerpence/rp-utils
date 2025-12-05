import * as yaml from "js-yaml";
import { promises as fsa } from "fs";
import path from "path";
import { z } from "zod";

import {
    deleteFile,
    getAppPath,
    getAllDirEntries,
    writeTextFile,
} from "./filesystem";

import { convertDateToStringYYYY_MM_DD } from "./date";

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * A proxy for the fs.Dirent object. SvelteKit does not allow referencing the FS module in client-side code.
 */
export type DirentInfo = {
    name: string;
    path: string;
    parentPath: string;
};

/**
 * Represents a validated markdown file with strongly-typed frontmatter.
 *
 * @template T - The validated type of the frontmatter object
 */
export type MarkdownObject<T extends Record<string, any>> = {
    content: string;
    frontMatter: T;
};

/**
 * Represents a markdown object with direent meta info.
 *
 * @template T - The validated type of the frontmatter object
 */
export type MarkdownDocument<T extends Record<string, any>> = {
    dirent: DirentInfo;
    markdownObject: MarkdownObject<T>;
};

/**
 * Represents a parsed markdown file with frontmatter and content.
 *
 * @template T - The type of the frontmatter object (defaults to Record<string, any>)
 */
export interface ParsedMarkdown<
    T extends Record<string, any> = Record<string, any>
> {
    /** The parsed YAML frontmatter as an object */
    frontMatter: T;
    /** The markdown content (everything after the frontmatter) */
    content: string;
}

/**
 * Result of parsing a single markdown file.
 * Contains either success with parsed data or failure with error information.
 */
export type ParseResult =
    | {
          success: true;
          data: { frontMatter: Record<string, any>; content: string };
      }
    | { success: false; error: string; filename: string };

/**
 * Represents a markdown file with its file system information and parsed content.
 * The frontmatter is untyped (Record<string, any>) until validated.
 */
export type MarkdownFileResult = {
    /** File system directory entry information */
    dirent: DirentInfo;
    /** Parsed markdown content with untyped frontmatter */
    markdownObject: {
        frontMatter: Record<string, any>;
        content: string;
    };
};

/**
 * Result of parsing multiple markdown files from a directory.
 * Separates successfully parsed files from failed ones.
 */
export type MarkdownParseResult = {
    /** Array of successfully parsed markdown files */
    successful: MarkdownFileResult[];
    /** Array of files that failed to parse with error information */
    failed: Array<{
        filename: string;
        dirent: DirentInfo;
        error: string;
    }>;
};

/**
 * Result of validating markdown files against a Zod schema.
 * Contains validation statistics, errors, and successfully validated objects.
 *
 * @template T - The validated type of the frontmatter object
 */
export type MarkdownObjectsValidState<T extends Record<string, any>> = {
    /** Total number of files found */
    filesFound: number;
    /** Number of files that passed validation */
    filesValid: number;
    /** Array of validation error messages */
    validationErrors: string[];
    /** Array of successfully validated markdown files with typed frontmatter */
    validatedObjects: MarkdownDocument<T>[];
};

// /**
//  * Collection of markdown files with validation statistics.
//  * @deprecated Use MarkdownParseResult and MarkdownObjectsValidState instead
//  */
// export type MarkdownObjectsCollection = {
//     filesFound: number;
//     filesValid: number;
//     collection: MarkdownFileResult[];
// };

// ============================================================================
// Functions
// ============================================================================

/**
 * Retrieves and parses all markdown files from a specified directory.
 *
 * Reads all `.md` files in the given folder, parses their frontmatter and content,
 * and separates successfully parsed files from failed ones. The frontmatter in
 * successful files is untyped (Record<string, any>) until validated with a schema.
 *
 * @param folder - Path to the directory containing markdown files
 * @returns Promise resolving to an object with successful and failed parse results
 *
 * @example
 * Parse all markdown files in a directory
 * ```typescript
 * const { successful, failed } = await getMarkdownObjects('./posts');
 * console.log(`Parsed ${successful.length} files, ${failed.length} failed`);
 *
 * successful.forEach(file => {
 *   console.log(`File: ${file.dirent.name}`);
 *   console.log(`Frontmatter:`, file.markdownObject.frontMatter);
 * });
 *
 * if (failed.length > 0) {
 *   failed.forEach(f => console.error(`${f.filename}: ${f.error}`));
 * }
 * ```
 */
export async function getMarkdownObjects(
    folder: string
): Promise<MarkdownParseResult> {
    const fileInfo: DirentInfo[] = getAllDirEntries(folder) ?? [];

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
 * Validates markdown frontmatter against a Zod schema and returns typed results.
 *
 * Takes untyped parsed markdown files and validates their frontmatter against the provided
 * Zod schema. Successfully validated files are returned with properly typed frontmatter,
 * while validation errors are collected for review.
 *
 * @template T - The validated type of the frontmatter (inferred from schema)
 * @param objects - Array of parsed markdown files with untyped frontmatter
 * @param schema - Zod schema defining the expected frontmatter structure
 * @returns Object containing statistics, errors, and validated files with typed frontmatter
 *
 * @example
 * Validate and use typed frontmatter
 * ```typescript
 * const { successful } = await getMarkdownObjects('./posts');
 * const validation = validateMarkdownObjects(successful, TechnicalNoteFrontmatterSchema);
 *
 * if (validation.filesValid === validation.filesFound) {
 *   console.log('All files valid!');
 *   // validatedObjects have typed frontmatter
 *   validation.validatedObjects.forEach(obj => {
 *     console.log(obj.markdownObject.frontMatter.title); // Type-safe!
 *   });
 * } else {
 *   console.log(`${validation.filesValid}/${validation.filesFound} valid`);
 *   console.error(validation.validationErrors.join('\n'));
 * }
 * ```
 *
 * @example
 * Write validation errors to file
 * ```ts
 * const validation = validateMarkdownObjects(files, schema);
 * if (validation.validationErrors.length > 0) {
 *   await writeTextFile(
 *     validation.validationErrors.join('\n'),
 *     'validation-errors.txt'
 *   );
 * }
 * ```
 */
export function validateMarkdownObjects<T extends Record<string, any>>(
    objects: MarkdownFileResult[],
    schema: z.ZodSchema<T>
): MarkdownObjectsValidState<T> {
    const validationErrors: string[] = [];
    const validatedObjects: MarkdownDocument<T>[] = [];
    const now = new Date();

    let filesFound = objects.length;
    let filesValid = 0;
    let previousFilename = "";

    objects.forEach((obj) => {
        const result = schema.safeParse(obj.markdownObject.frontMatter);

        if (!result.success) {
            const fullFilename = path.join(
                obj.dirent.parentPath,
                obj.dirent.name
            );
            result.error.issues.forEach((issue) => {
                if (fullFilename !== previousFilename) {
                    validationErrors.push(`\nFilename: ${fullFilename}`);
                    previousFilename = fullFilename;
                }
                validationErrors.push(
                    `    Error: ${issue.path.join(".")}: ${issue.message}`
                );
            });
        } else {
            filesValid++;
            validatedObjects.push({
                dirent: obj.dirent,
                markdownObject: {
                    frontMatter: result.data, // Now properly typed as T!
                    content: obj.markdownObject.content,
                },
            });
        }
    });

    if (validationErrors.length > 0) {
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
        validatedObjects,
    };
}

/**
 * Parses a markdown file with YAML frontmatter.
 *
 * Extracts frontmatter delimited by `---` markers at the beginning of the file
 * and parses it as YAML. The remaining content is returned as plain text.
 * Returns a Result type with either success (parsed data) or failure (error details).
 *
 * This function converts string dates in the format 'yyyy-dd-dd' to Date data types.
 *
 * @param filename - Absolute or relative path to the markdown file
 * @returns Promise resolving to ParseResult with success/failure information
 *
 * @example
 * Parse a markdown file
 * ```typescript
 * const result = await parseMarkdownFile('./posts/article.md');
 *
 * if (result.success) {
 *   console.log('Title:', result.data.frontMatter.title);
 *   console.log('Content length:', result.data.content.length);
 * } else {
 *   console.error(`Parse failed: ${result.filename}`);
 *   console.error(`Error: ${result.error}`);
 * }
 * ```
 *
 * @example
 * Handle parsing errors
 * ```typescript
 * const result = await parseMarkdownFile('invalid.md');
 * if (!result.success) {
 *   console.error(`Failed to parse ${result.filename}: ${result.error}`);
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

            parsedFrontMatter =
                convertFrontMatterStringDates(parsedFrontMatter);

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

function convertFrontMatterStringDates(
    parsedFrontMatter: Record<string, any>
): Record<string, any> {
    const result: Record<string, any> = {};

    // Iterate over all keys and values
    for (const [key, value] of Object.entries(parsedFrontMatter)) {
        // Process each key-value pair
        //debugger;
        // console.log(`Key: ${key}, Value:`, value);

        // You can check value types and convert dates
        if (typeof value === "string") {
            // Check if it's a date string (YYYY-MM-DD or YYYY-MM-DD HH:MM)
            const datePattern = /^\d{4}-\d{2}-\d{2}( \d{2}:\d{2})?$/;
            if (datePattern.test(value)) {
                result[key] = new Date(value);
            } else {
                result[key] = value;
            }
        } else {
            // Keep non-string values as-is
            result[key] = value;
        }
    }

    return result;
}

/**
 * Writes a ParsedMarkdown object to a file with YAML frontmatter.
 *
 * Serializes the frontmatter object to YAML format, wraps it in `---` delimiters,
 * and combines it with the markdown content before writing to the specified file.
 * If frontmatter is empty, only content is written.
 *
 * @param parsedMarkdown - Object containing frontmatter and content to write
 * @param outputFilename - Path where the markdown file should be written
 * @returns Promise that resolves when file is successfully written
 * @throws Error if file write fails
 *
 * @example
 * Write markdown with frontmatter
 * ```ts
 * const document = {
 *   frontMatter: {
 *     title: "My Article",
 *     date: "2025-12-03",
 *     tags: ["typescript", "markdown"]
 *   },
 *   content: "# Hello World\n\nThis is my content."
 * };
 *
 * await writeMarkdownFile(document, "./output/article.md");
 *
 * Creates this file:
 * ---
 * title: My Article
 * date: '2025-12-03'
 * tags:
 *   - typescript
 *   - markdown
 * ---
 * # Hello World
 * This is my content.
 * ```
 * @example
 * Write content-only markdown
 * ```ts
 * await writeMarkdownFile(
 *   { frontMatter: {}, content: "# Just content" },
 *   "simple.md"
 * );
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
