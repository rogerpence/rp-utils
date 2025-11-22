import {
    getFullPath,
    getProjectRoot,
    getCurrentDirectoryForFile,
} from "../../src/filesystem.ts";

// const markdownDataPath = getTestDataPath(
//     "tests",
//     "test-data",
//     "markdown",
//     "all-good"
// );
// console.log(markdownDataPath);

// let markdownDataPath = getFullPath("tests\\test-data\\markdown\\all-good");
// console.info(markdownDataPath);

// try {
//     markdownDataPath = getFullPath("tests\\test-data");
//     console.info(markdownDataPath);
// } catch (error: unknown) {
//     if (error instanceof Error) {
//         console.error(error.message);
//     } else {
//         console.error(String(error));
//     }
// }

console.log(getProjectRoot());
