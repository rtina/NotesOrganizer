import { z } from "zod";

export const PresignSchema = z.object({
  body: z.object({
    fileName: z.string().min(1).max(255),
    mimeType: z.string().min(1).max(255),
    size: z.number().int().positive().max(50 * 1024 * 1024),
    noteId: z.string().optional(),
  }),
});

export const ConfirmSchema = z.object({
  body: z.object({
    key: z.string().min(1),
    fileName: z.string().min(1),
    mimeType: z.string().min(1),
    size: z.number().int().positive(),
    noteId: z.string().optional(),
  }),
});