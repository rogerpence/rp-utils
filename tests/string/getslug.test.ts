import { describe, it, expect } from "vitest";
import { getSlug } from "../../src/string";

describe("test get slug", () => {
    describe("should return a valid slug", () => {
        it("should return a valid slug", () => {
            const parentPath =
                "C:\\Users\\thumb\\Documents\\projects\\svelte\\mdsvex\\src\\lib\\markdown\\technical-posts";
            const filename =
                "accessing-podman-from-another-wsl-distribution.md";
            const slug = getSlug(parentPath, filename);
            expect(slug).toEqual(
                "technical-posts/accessing-podman-from-another-wsl-distribution"
            );
        });
    });
});
