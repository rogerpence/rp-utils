import ansis from "ansis";

declare global {
    interface Console {
        success(...args: any[]): void;
        jsonString(jsonObj: any): void;
    }
}

// Store original methods if you need them
const originalError = console.error;
const originalLog = console.log;
const originalInfo = console.info;
const originalWarn = console.warn;

// warn

console.error = function (...args: any[]): void {
    originalError(ansis.redBright(args.join(" ")));
};

console.log = function (...args: any[]): void {
    originalLog(ansis.blue(args.join(" ")));
};

console.info = function (...args: any[]): void {
    originalLog(ansis.cyan(args.join(" ")));
};

console.warn = function (...args: any[]): void {
    originalLog(ansis.yellow(args.join(" ")));
};

console.success = function (...args: any[]): void {
    originalLog(ansis.greenBright(args.join(" ")));
};

console.jsonString = function (jsonObj: any): void {
    originalLog(ansis.green(JSON.stringify(jsonObj, null, 4)));
};

/**
 * Console extensions that add color-coded logging methods.
 *
 * Import this module to add the following methods to the global console object:
 * - `console.success()` - Green text for success messages
 * - `console.jsonString()` - Pretty-printed JSON in green
 * - Enhanced `console.error()` - Red text
 * - Enhanced `console.log()` - Blue text
 * - Enhanced `console.info()` - Cyan text
 * - Enhanced `console.warn()` - Yellow text
 *
 * @example
 * ```typescript
 * import '@rogerpence/rp-utils/console';
 *
 * console.success('Operation completed!');
 * console.jsonString({ foo: 'bar' });
 * ```
 */
export const consoleExtensions = true;
