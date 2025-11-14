import "./console";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

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
 *
 * @param segments
 * @returns fully-qualified path to the file specified.
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

export function getParentPath(currentMetaUrl: string): string {
  const fullFilePath = fileURLToPath(currentMetaUrl);

  return path.dirname(fullFilePath);
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
export function truncatePathAfterDirectory(
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

export type WriteObjectToFileOptions = {
  exportName?: string;
  compressed?: boolean;
  log?: boolean;
};

/**
 * Writes a JavaScript object to a JSON file.
 *
 * @param {string} filePath - The path where the JSON file will be written
 * @param {unknown} object - The object to serialize and write to the file
 * @param {WriteObjectToFileOptions} [options] - Optional configuration
 * @param {string} [options.exportName] - Names the array when creating a TypeScript file.
 * @param {boolean} [options.compressed=false] - If true, writes minified JSON without whitespace
 * @param {boolean} [options.log=true] - If true, logs success message to console
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
  const { compressed = false, log = true } = options ?? {};

  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      console.error(`writeObjectToFile error:  ${dir} not found`);
      process.exit(1);
    }

    if (filePath.endsWith(".json") && options?.exportName) {
      console.error(
        `writeObjectToFile error:  Cannot not write to .json file with export name`,
      );
      process.exit(1);
    }

    if (filePath.endsWith(".js") && !options?.exportName) {
      console.error(
        `writeObjectToFile error:  Must provide an export name for a .js`,
      );
      process.exit(1);
    }

    const exportedName = options?.exportName
      ? `export const ${options?.exportName} = `
      : "";

    // Serialize with appropriate formatting
    const json = compressed
      ? JSON.stringify(object)
      : JSON.stringify(object, null, 4);

    // Write to file
    fs.writeFileSync(filePath, `${exportedName}${json}`, "utf-8");

    // Optional logging
    if (log) {
      console.success(`✓ Wrote ${filePath}`);
    }
  } catch (error) {
    console.error(`Failed to write file ${filePath}:`, error);
    throw error;
  }
}
