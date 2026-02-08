"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

export default function PublicNotePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [note, setNote] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api<{ ok: true; note: any }>(`/notes/public/${slug}`);
        setNote(res.note);
      } catch (e: any) {
        setErr(e?.message || "Not found");
      }
    })();
  }, [slug]);

  if (err) return <main className="page text-red-600">{err}</main>;
  if (!note) return <main className="page">Loading...</main>;

  return (
    <main className="page space-y-3">
      <h1 className="text-2xl font-bold">{note.title}</h1>
      <div className="text-sm text-muted">{note.dayKey}</div>
      <pre className="note-content">{note.content}</pre>
    </main>
  );
}