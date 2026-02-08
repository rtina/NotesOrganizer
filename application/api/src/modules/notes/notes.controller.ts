import type { Request, Response, NextFunction } from "express";
import { createNote, deleteNote, getNote, listNotes, listPublicNotes, setVisibility, updateNote } from "./notes.service";
import { getPublicNoteBySlug, getUnlistedNoteByToken } from "./notes.policy";

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, content, dayKey } = req.body;
    // Added a check or cast for req.user!.id if necessary
    const note = await createNote(req.user!.id, title, content, dayKey);
    res.status(201).json({ ok: true, note });
  } catch (e) {
    next(e);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    // You already had safety checks here, which is good!
    const q = typeof req.query.q === "string" ? req.query.q : undefined;
    const dayKey = typeof req.query.dayKey === "string" ? req.query.dayKey : undefined;
    const notes = await listNotes(req.user!.id, q, dayKey);
    res.json({ ok: true, notes });
  } catch (e) {
    next(e);
  }
}

export async function read(req: Request, res: Response, next: NextFunction) {
  try {
    // Cast to string to satisfy the compiler
    const note = await getNote(req.user!.id, req.params.id as string);
    res.json({ ok: true, note });
  } catch (e) {
    next(e);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const note = await updateNote(req.user!.id, req.params.id as string, req.body);
    res.json({ ok: true, note });
  } catch (e) {
    next(e);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await deleteNote(req.user!.id, req.params.id as string);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

export async function visibility(req: Request, res: Response, next: NextFunction) {
  try {
    const note = await setVisibility(req.user!.id, req.params.id as string, req.body.visibility);
    res.json({ ok: true, note });
  } catch (e) {
    next(e);
  }
}

export async function publicBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    // Ensure slug is a string
    const note = await getPublicNoteBySlug(req.params.slug as string);
    res.json({ ok: true, note });
  } catch (e) {
    next(e);
  }
}

export async function unlistedByToken(req: Request, res: Response, next: NextFunction) {
  try {
    // Ensure token is a string
    const note = await getUnlistedNoteByToken(req.params.token as string);
    res.json({ ok: true, note });
  } catch (e) {
    next(e);
  }
}

export async function publicFeed(_req: Request, res: Response, next: NextFunction) {
  try {
    const notes = await listPublicNotes();
    res.json({ ok: true, notes });
  } catch (e) {
    next(e);
  }
}
