import { defineConfig, configDefaults } from "vitest/config";

export default defineConfig({
    test: {
        //reporters: ["verbose"],
        // Or keep default reporter but show console
        silent: false,
    },
});
