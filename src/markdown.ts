import * as yaml from "js-yaml";
import { promises as fsa } from "fs";

export interface ParsedMarkdown<
    T extends Record<string, any> = Record<string, any>
> {
    frontMatter: T;
    content: string;
    rawFrontMatter?: string;
}

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
            rawFrontMatter: rawFrontMatter || undefined,
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
