import type { Request, Response, NextFunction } from "express";
import {
  confirmFile,
  createPresignedUpload,
  deleteFile,
  getDownloadUrl,
  getPreviewUrl,
  uploadFileDirect,
} from "./files.service";

// 1. Define the specific shape of the params for these routes
interface IdParam {
  id: string;
}

export async function presign(req: Request, res: Response, next: NextFunction) {
  try {
    const { fileName, mimeType, size, noteId } = req.body;
    const result = await createPresignedUpload(req.user!.id, { fileName, mimeType, size, noteId });
    res.json({ ok: true, ...result });
  } catch (e) {
    next(e);
  }
}

export async function confirm(req: Request, res: Response, next: NextFunction) {
  try {
    const file = await confirmFile(req.user!.id, req.body);
    res.status(201).json({ ok: true, file });
  } catch (e) {
    next(e);
  }
}

// Instead of Request<IdParam>, use Request<any> or Request
export async function downloadUrl(req: Request<any>, res: Response, next: NextFunction) {
  try {
    // req.params.id will now be treated as 'any', allowing it to pass to the service
    const result = await getDownloadUrl(req.user!.id, req.params.id);
    res.json({ ok: true, ...result });
  } catch (e) {
    next(e);
  }
}

export async function previewUrl(req: Request<any>, res: Response, next: NextFunction) {
  try {
    const result = await getPreviewUrl(req.user!.id, req.params.id);
    res.json({ ok: true, ...result });
  } catch (e) {
    next(e);
  }
}

export async function remove(req: Request<any>, res: Response, next: NextFunction) {
  try {
    const result = await deleteFile(req.user!.id, req.params.id);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

export async function uploadDirect(req: Request, res: Response, next: NextFunction) {
  try {
    const fileName = String(req.headers["x-file-name"] || "");
    const mimeType = String(req.headers["x-mime-type"] || "application/octet-stream");
    const noteId = req.headers["x-note-id"] ? String(req.headers["x-note-id"]) : undefined;
    const sizeHeader = req.headers["x-file-size"] ? Number(req.headers["x-file-size"]) : undefined;

    if (!fileName) {
      const err = new Error("Missing X-File-Name header");
      (err as any).status = 400;
      throw err;
    }

    if (!Buffer.isBuffer(req.body)) {
      const err = new Error("Invalid upload body");
      (err as any).status = 400;
      throw err;
    }

    if (sizeHeader && req.body.length !== sizeHeader) {
      const err = new Error("Upload size mismatch");
      (err as any).status = 400;
      throw err;
    }

    const result = await uploadFileDirect(req.user!.id, {
      fileName,
      mimeType,
      size: sizeHeader || req.body.length,
      noteId,
      body: req.body as Buffer,
    });

    res.status(201).json({ ok: true, ...result });
  } catch (e) {
    next(e);
  }
}
