import { prisma } from "../../config/prisma";

export async function getPublicNoteBySlug(slug: string) {
  const note = await prisma.note.findFirst({
    where: { slug, visibility: "PUBLIC" },
    include: { files: true },
  });

  if (!note) {
    const err = new Error("Note not found");
    (err as any).status = 404;
    throw err;
  }
  return note;
}

export async function getUnlistedNoteByToken(token: string) {
  const note = await prisma.note.findFirst({
    where: { shareToken: token, visibility: "UNLISTED" },
    include: { files: true },
  });

  if (!note) {
    const err = new Error("Note not found");
    (err as any).status = 404;
    throw err;
  }
  return note;
}