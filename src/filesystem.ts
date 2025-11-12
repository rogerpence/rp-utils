import "$lib/cli/console-extensions";
import { fileURLToPath } from "url";
import path from "path";

export function getRelativePath() {
    const fullFilePath = fileURLToPath(import.meta.url);

    return path.dirname(fullFilePath);
}

/**
 *
 * @param fullPath
 * @param lastDirectory
 * @returns 'fullPath' value truncated after 'lastDirectory'
 * @example
 * truncatePathAfter(`c:\\one\\two\\three\\test.json`, 'two')
 * returns `c:\\one\\two`
 * An error occurs and processing stops if 'fullPath' doesn't
 * include the 'lastDirectory' folder.
 */

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

/**
 *
 * @param segments
 * @returns fully-qualified path to the file specified.
 * @description
 *
 * This function is for use only for CLI use in the dev
 * environment. It will not work in a serverless deployment
 * environment.
 *
 * This function is usually used to get a fully-qualified
 * file name in the '../src/lib/data' directory for CLI
 * reading and writing purposes.
 *
 * If only a single element is passed, that element is assumed
 * to be a file name in the /src/lib/data folder and a
 * fully-qualifed reference to that file name is returned.
 *
 * If multiple elements are passed, the last elenent is assumed
 * to be a file name, the preceding elements are folder names
 * under the 'src' folder. For example:
 *  const x = getPathForCli('markdown', 'kb', 'test.json')
 * returns the the fully qualified file name for
 * .../src/markdown/kb/test.json
 */

export function getPathForCli(...segments: string[]): string {
    // Regardless of where this source file is located, results
    // are always under SvelteKit's 'src' folder.
    const srcPath = truncatePathAfterDirectory(process.cwd(), "src");

    if (segments.length == 1) {
        segments.push();
        segments = ["lib", "data", ...segments];
    }

    return path.join(srcPath, ...segments);
}
