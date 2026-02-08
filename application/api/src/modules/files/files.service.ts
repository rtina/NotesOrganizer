import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../../config/env";
import { prisma } from "../../config/prisma";
import { isB2Configured, b2 } from "../../config/b2";
import { randomToken } from "../../utils/crypto";

function assertB2() {
  if (!isB2Configured) {
    const err = new Error("Backblaze B2 is not configured. Set B2_* env vars.");
    (err as any).status = 500;
    throw err;
  }
}

function buildObjectKey(userId: string, fileName: string) {
  const safeName = fileName.replace(/[^\w.\-()\s]/g, "_");
  return `${userId}/${Date.now()}-${randomToken(10)}-${safeName}`;
}

export async function createPresignedUpload(
  userId: string,
  input: { fileName: string; mimeType: string; size: number; noteId?: string }
) {
  assertB2();

  const key = buildObjectKey(userId, input.fileName);

  const cmd = new PutObjectCommand({
    Bucket: env.B2_BUCKET,
    Key: key,
    ContentType: input.mimeType,
  });

  const uploadUrl = await getSignedUrl(b2, cmd, { expiresIn: 60 * 5 });
  return { key, uploadUrl };
}

export async function uploadFileDirect(
  userId: string,
  input: { fileName: string; mimeType: string; size: number; noteId?: string; body: Buffer }
) {
  assertB2();

  if (input.noteId) {
    const note = await prisma.note.findFirst({ where: { id: input.noteId, userId } });
    if (!note) {
      const err = new Error("Invalid noteId");
      (err as any).status = 400;
      throw err;
    }
  }

  const key = buildObjectKey(userId, input.fileName);

  await b2.send(
    new PutObjectCommand({
      Bucket: env.B2_BUCKET,
      Key: key,
      ContentType: input.mimeType,
      Body: input.body,
    })
  );

  const url = env.B2_PUBLIC_BASE_URL ? `${env.B2_PUBLIC_BASE_URL}/${key}` : null;

  const file = await prisma.file.create({
    data: {
      userId,
      noteId: input.noteId ?? null,
      provider: "b2",
      key,
      url,
      fileName: input.fileName,
      mimeType: input.mimeType,
      size: input.size,
    },
  });

  return { file };
}

export async function confirmFile(
  userId: string,
  input: { key: string; fileName: string; mimeType: string; size: number; noteId?: string }
) {
  if (input.noteId) {
    const note = await prisma.note.findFirst({ where: { id: input.noteId, userId } });
    if (!note) {
      const err = new Error("Invalid noteId");
      (err as any).status = 400;
      throw err;
    }
  }

  const url = env.B2_PUBLIC_BASE_URL ? `${env.B2_PUBLIC_BASE_URL}/${input.key}` : null;

  return prisma.file.create({
    data: {
      userId,
      noteId: input.noteId ?? null,
      provider: "b2",
      key: input.key,
      url,
      fileName: input.fileName,
      mimeType: input.mimeType,
      size: input.size,
    },
  });
}

export async function getDownloadUrl(userId: string, fileId: string) {
  assertB2();

  const file = await prisma.file.findFirst({ where: { id: fileId, userId } });
  if (!file) {
    const err = new Error("File not found");
    (err as any).status = 404;
    throw err;
  }

  const cmd = new GetObjectCommand({
    Bucket: env.B2_BUCKET,
    Key: file.key,
  });

  const downloadUrl = await getSignedUrl(b2, cmd, { expiresIn: 60 * 5 });
  return { file, downloadUrl };
}

export async function getPreviewUrl(userId: string, fileId: string) {
  assertB2();

  const file = await prisma.file.findFirst({ where: { id: fileId, userId } });
  if (!file) {
    const err = new Error("File not found");
    (err as any).status = 404;
    throw err;
  }

  const safeName = file.fileName.replace(/["\\]/g, "");

  const cmd = new GetObjectCommand({
    Bucket: env.B2_BUCKET,
    Key: file.key,
    ResponseContentDisposition: `inline; filename="${safeName}"`,
    ResponseContentType: file.mimeType || "application/octet-stream",
  });

  const previewUrl = await getSignedUrl(b2, cmd, { expiresIn: 60 * 5 });
  return { file, previewUrl };
}

export async function deleteFile(userId: string, fileId: string) {
  assertB2();

  const file = await prisma.file.findFirst({ where: { id: fileId, userId } });
  if (!file) {
    const err = new Error("File not found");
    (err as any).status = 404;
    throw err;
  }

  await b2.send(new DeleteObjectCommand({ Bucket: env.B2_BUCKET, Key: file.key }));
  await prisma.file.delete({ where: { id: fileId } });

  return { ok: true };
}
