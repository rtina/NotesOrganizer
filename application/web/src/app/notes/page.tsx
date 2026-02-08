"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { logout } from "@/lib/auth";
import NoteCard from "@/components/NoteCard";

type NoteListItem = {
  id: string;
  title: string;
  visibility: "PRIVATE" | "PUBLIC" | "UNLISTED";
  dayKey: string;
  updatedAt: string;
};

export default function NotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<NoteListItem[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");

  async function load() {
    setErr(null);
    try {
      const res = await api<{ ok: true; notes: NoteListItem[] }>(`/notes?q=${encodeURIComponent(q)}`);
      setNotes(res.notes);
    } catch (e: any) {
      if (String(e?.message || "").toLowerCase().includes("unauthorized")) {
        router.push("/notes/login");
        return;
      }
      setErr(e?.message || "Failed to load");
    }
  }

  async function onDelete(id: string) {
    await api(`/notes/${id}`, { method: "DELETE" });
    await load();
  }

  async function onLogout() {
    await logout();
    router.push("/notes/login");
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="page space-y-5">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold">My Notes</h1>
          <div className="text-muted text-sm">Search, edit, and organize your daily work notes.</div>
        </div>
        <div className="toolbar">
          <Link className="btn" href="/notes/new">
            New Note
          </Link>
        </div>
      </div>

      <div className="search-row search-row-spaced">
        <input
          className="input"
          placeholder="Search notes..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="btn search-button" onClick={load}>
          Search
        </button>
      </div>

      {err ? <div className="text-sm text-red-600">{err}</div> : null}

      <div className="space-y-4">
        {notes.map((n) => (
          <NoteCard key={n.id} note={n} onDelete={onDelete} />
        ))}
        {notes.length === 0 ? <div className="text-sm text-muted">No notes yet.</div> : null}
      </div>
    </main>
  );
}
