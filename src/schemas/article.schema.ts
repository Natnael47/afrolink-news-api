import { z } from "zod";

export const createArticleSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(150, "Title must be less than 150 characters"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  category: z.string().min(1, "Category is required"),
  status: z.enum(["draft", "published"]).default("draft"),
});

export const updateArticleSchema = z.object({
  title: z.string().min(1).max(150).optional(),
  content: z.string().min(50).optional(),
  category: z.string().optional(),
  status: z.enum(["draft", "published"]).optional(),
});

export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
