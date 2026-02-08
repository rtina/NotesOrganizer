import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { validate } from "../../middleware/validate";
import {
  CreateNoteSchema,
  ListNotesSchema,
  PublicSlugSchema,
  SetVisibilitySchema,
  ShareTokenSchema,
  UpdateNoteSchema,
} from "./notes.schemas";
import {
  create,
  list,
  publicBySlug,
  publicFeed,
  read,
  remove,
  unlistedByToken,
  update,
  visibility,
} from "./notes.controller";

const router = Router();

// Public FIRST
router.get("/public/:slug", validate(PublicSlugSchema), publicBySlug);
router.get("/public", publicFeed);
router.get("/share/:token", validate(ShareTokenSchema), unlistedByToken);

// Owner routes
router.post("/", requireAuth, validate(CreateNoteSchema), create);
router.get("/", requireAuth, validate(ListNotesSchema), list);
router.get("/:id", requireAuth, read);
router.put("/:id", requireAuth, validate(UpdateNoteSchema), update);
router.delete("/:id", requireAuth, remove);
router.put("/:id/visibility", requireAuth, validate(SetVisibilitySchema), visibility);

export default router;
