import { prisma } from "../../config/prisma";
import { toSlug } from "../../utils/slug";
import { randomToken } from "../../utils/crypto";

export async function createNote(userId: string, title: string, content: string, dayKey: string) {
  return prisma.note.create({
    data: { userId, title, content, dayKey },
  });
}

export async function listNotes(userId: string, q?: string, dayKey?: string) {
  return prisma.note.findMany({
    where: {
      userId,
      ...(dayKey ? { dayKey } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { content: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
    select: {
      id: true,
      title: true,
      visibility: true,
      dayKey: true,
      slug: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getNote(userId: string, id: string) {
  const note = await prisma.note.findFirst({
    where: { id, userId },
    include: { files: true },
  });

  if (!note) {
    const err = new Error("Note not found");
    (err as any).status = 404;
    throw err;
  }

  return note;
}

export async function updateNote(userId: string, id: string, data: any) {
  await getNote(userId, id);
  return prisma.note.update({
    where: { id },
    data,
    include: { files: true },
  });
}

export async function deleteNote(userId: string, id: string) {
  await getNote(userId, id);

  await prisma.file.updateMany({
    where: { noteId: id, userId },
    data: { noteId: null },
  });

  await prisma.note.delete({ where: { id } });
  return { ok: true };
}

export async function setVisibility(userId: string, id: string, visibility: "PRIVATE" | "PUBLIC" | "UNLISTED") {
  const note = await getNote(userId, id);
  const update: any = { visibility };

  if (visibility === "PUBLIC") {
    update.slug = note.slug ?? `${toSlug(note.title)}-${note.id.slice(-6)}`;
    update.shareToken = null;
  } else if (visibility === "UNLISTED") {
    update.shareToken = note.shareToken ?? randomToken(24);
    update.slug = null;
  } else {
    update.slug = null;
    update.shareToken = null;
  }

  return prisma.note.update({
    where: { id },
    data: update,
    include: { files: true },
  });
}

export async function listPublicNotes() {
  return prisma.note.findMany({
    where: { visibility: "PUBLIC", slug: { not: null } },
    orderBy: { updatedAt: "desc" },
    take: 100,
    select: {
      id: true,
      title: true,
      dayKey: true,
      slug: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: { email: true },
      },
    },
  });
}
