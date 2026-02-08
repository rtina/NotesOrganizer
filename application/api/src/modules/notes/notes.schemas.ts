import { z } from "zod";

export const CreateNoteSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    content: z.string().default(""),
    dayKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
});

export const UpdateNoteSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    content: z.string().optional(),
    dayKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  }),
});

export const ListNotesSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    dayKey: z.string().optional(),
  }),
});

export const SetVisibilitySchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    visibility: z.enum(["PRIVATE", "PUBLIC", "UNLISTED"]),
  }),
});

export const PublicSlugSchema = z.object({
  params: z.object({ slug: z.string().min(1) }),
});

export const ShareTokenSchema = z.object({
  params: z.object({ token: z.string().min(10) }),
});