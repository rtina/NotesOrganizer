"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import NoteEditor from "@/components/NoteEditor";
import VisibilitySelect from "@/components/VisibilitySelect";
import FileUploader from "@/components/FileUploader";

type FileRow = {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
};

type Note = {
  id: string;
  title: string;
  content: string;
  dayKey: string;
  visibility: "PRIVATE" | "PUBLIC" | "UNLISTED";
  slug: string | null;
  shareToken: string | null;
  files: FileRow[];
};

export default function NoteDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [note, setNote] = useState<Note | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const publicUrl = useMemo(() => {
    if (!note?.slug) return null;
    return `${window.location.origin}/public/${note.slug}`;
  }, [note?.slug]);

  const shareUrl = useMemo(() => {
    if (!note?.shareToken) return null;
    return `${window.location.origin}/share/${note.shareToken}`;
  }, [note?.shareToken]);

  async function load() {
    setErr(null);
    try {
      const res = await api<{ ok: true; note: Note }>(`/notes/${id}`);
      setNote(res.note);
    } catch (e: any) {
      if (String(e?.message || "").toLowerCase().includes("unauthorized")) {
        router.push("/notes/login");
        return;
      }
      setErr(e?.message || "Failed to load note");
    }
  }

  async function save(next: { title: string; content: string }) {
    const res = await api<{ ok: true; note: Note }>(`/notes/${id}`, {
      method: "PUT",
      json: next,
    });
    setNote(res.note);
  }

  async function changeVisibility(v: "PRIVATE" | "PUBLIC" | "UNLISTED") {
    const res = await api<{ ok: true; note: Note }>(`/notes/${id}/visibility`, {
      method: "PUT",
      json: { visibility: v },
    });
    setNote(res.note);
  }

  useEffect(() => {
    load();
  }, [id]);

  if (err) {
    return (
      <main className="page space-y-3">
        <div className="text-red-600">{err}</div>
        <button className="btn-ghost" onClick={() => router.push("/notes")}>
          Back
        </button>
      </main>
    );
  }

  if (!note) {
    return (
      <main className="page">
        <div>Loading...</div>
      </main>
    );
  }

  return (
    <main className="page space-y-4">
      <div className="page-header note-detail-header">
        <button className="btn-ghost text-sm back-button" onClick={() => router.push("/notes")}>
          &larr; Back
        </button>
        <div className="text-sm text-muted">{note.dayKey}</div>
      </div>

      <VisibilitySelect
        visibility={note.visibility}
        publicUrl={publicUrl}
        shareUrl={shareUrl}
        onChange={changeVisibility}
      />

      <NoteEditor title={note.title} content={note.content} onSave={save} />

      <FileUploader noteId={note.id} files={note.files} onUploaded={load} />
    </main>
  );
}
