import { describe, it, expect } from "vitest";

import { walkJson, type JSONValue } from "../../src/objects";

// walkJson should walk an arbitrary object.

const testObj = [
    {
        name: "neil",
        tags: ["hammer", "screwdriver", "square"],
    },
    {
        name: "neil",
        tags: ["knife", "screwdriver"],
    },
    {
        name: "neil",
        tags: ["square"],
    },
    {
        other: [
            {
                name: "neil",
                tags: ["punch"],
            },
            {
                name: "neil",
                tags: ["punch"],
            },
        ],
    },
];

// walkJson(testObj, ({ key, value }) => {
//     if (key === "tags") {
//         console.log(value);
//     }
// });

function getAllTags(data: JSONValue): string[] {
    const tags: string[] = [];

    walkJson(data, ({ path, value }) => {
        if (path.endsWith(".tags") && Array.isArray(value)) {
            for (const item of value) {
                if (typeof item === "string") tags.push(item);
            }
        }
    });

    return tags;
}

describe("test walkJson function", () => {
    it("should produce a comma delimited string", () => {
        const allTags = getAllTags(testObj);
        const uniqueTags = new Set(allTags.sort());
        const stringValue = [...uniqueTags].join(",");

        expect(stringValue).toBe("hammer,knife,punch,screwdriver,square");
    });
});
