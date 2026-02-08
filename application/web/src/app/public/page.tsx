"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

type PublicNote = {
  id: string;
  title: string;
  dayKey: string;
  slug: string | null;
  createdAt: string;
  updatedAt: string;
  user: { email: string };
};

export default function PublicFeedPage() {
  const [notes, setNotes] = useState<PublicNote[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api<{ ok: true; notes: PublicNote[] }>("/notes/public");
        setNotes(res.notes);
      } catch (e: any) {
        setErr(e?.message || "Failed to load");
      }
    })();
  }, []);

  return (
    <main className="page space-y-4">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold">Public Notes</h1>
          <div className="text-muted text-sm">Shared notes from the community.</div>
        </div>
      </div>

      {err ? <div className="text-sm text-red-600">{err}</div> : null}

      <div className="space-y-3">
        {notes.map((n) => (
          <div key={n.id} className="card note-card">
            <div>
              <Link className="note-title font-semibold" href={`/public/${n.slug}`}>
                {n.title}
              </Link>
              <div className="note-meta mt-1">
                <span>{n.dayKey}</span>
                <span>-</span>
                <span>{n.user.email}</span>
                <span>-</span>
                <span>{formatDate(n.updatedAt)}</span>
              </div>
            </div>
          </div>
        ))}
        {notes.length === 0 ? <div className="text-sm text-muted">No public notes yet.</div> : null}
      </div>
    </main>
  );
}

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}
