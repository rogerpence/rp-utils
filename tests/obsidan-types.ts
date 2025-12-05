import * as z from "zod";

export const TechnicalNoteFrontmatterSchema = z
    .object({
        title: z.string(),
        description: z.string(),
        date_created: z.union([z.string(), z.date()]),
        date_updated: z.union([z.string(), z.date()]),
        date_published: z.string().nullable().optional(),
        pinned: z.boolean(),
        tags: z.array(z.string()),
    })
    .strict();

export type TechnicalNoteFrontmatter = z.infer<
    typeof TechnicalNoteFrontmatterSchema
>;

const MarkdownDocumentSchema = z.object({
    title: z.string().min(1, "Title cannot be empty"),
    description: z.string().min(1, "Description cannot be empty"),
    date_updated: z.string(),
    pinned: z.boolean(),
    folder: z.string().min(1, "Folder cannot be empty"),
    filename: z
        .string()
        .regex(/^.+\.md$/, "Filename must end with .md and not be empty"), // Ensures it ends with .md
    slug: z.string().startsWith("/", "Slug must start with '/'"),
    tags: z.array(z.string().min(1, "Tag cannot be empty")), // Array of strings, each tag not empty
    content: z.string().optional(),
});

export type MarkdownDocument = z.infer<typeof MarkdownDocumentSchema>;
