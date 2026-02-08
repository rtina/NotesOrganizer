import express, { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { validate } from "../../middleware/validate";
import { ConfirmSchema, PresignSchema } from "./files.schemas";
import { confirm, downloadUrl, presign, previewUrl, remove, uploadDirect } from "./files.controller";

const router = Router();

router.post("/presign", requireAuth, validate(PresignSchema), presign);
router.post("/confirm", requireAuth, validate(ConfirmSchema), confirm);
router.post("/upload", requireAuth, express.raw({ type: "*/*", limit: "20mb" }), uploadDirect);
router.get("/:id/preview-url", requireAuth, previewUrl);
router.get("/:id/download-url", requireAuth, downloadUrl);
router.delete("/:id", requireAuth, remove);

export default router;
