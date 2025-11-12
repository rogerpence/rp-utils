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

export {};
