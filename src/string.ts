import path from "path";

/**
 * Get a slug from folder name and full file name.
 * @param {string} filePath
 * @param {string} fileName
 *
 *
 * @returns {string}
 */
export function getSlug(filePath: string, fileName: string): string {
    const folder = filePath.split("\\").at(-1) ?? "";
    return `${folder}/${fileName.split(".")[0]}`;
}
