import path from "path";

/**
 * Get a slug from folder name and full file name.
 * @param {string} filePath
 * @param {string} filename
 *
 *
 * @returns {string}
 */
export function getSlug(filePath: string, filenName: string): string {
    const folder = filePath.split("\\").at(-1) ?? "";
    return `${folder}/${filenName.split(".")[0]}`;
}
