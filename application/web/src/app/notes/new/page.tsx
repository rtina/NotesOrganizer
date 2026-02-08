"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { todayKey } from "@/lib/validators";

export default function NewNotePage() {
  const router = useRouter();
  const [title, setTitle] = useState("New note");
  const [content, setContent] = useState("");
  const [dayKey, setDayKey] = useState(todayKey());
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function create() {
    setErr(null);
    setLoading(true);
    try {
      const res = await api<{ ok: true; note: { id: string } }>("/notes", {
        method: "POST",
        json: { title, content, dayKey },
      });
      router.push(`/notes/${res.note.id}`);
    } catch (e: any) {
      if (String(e?.message || "").toLowerCase().includes("unauthorized")) {
        router.push("/notes/login");
        return;
      }
      setErr(e?.message || "Failed to create");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Create Note</h1>
        <p className="text-muted text-sm">Start with a title and add your content.</p>
      </div>

      <div className="space-y-3">
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className="input" value={dayKey} onChange={(e) => setDayKey(e.target.value)} />
        <textarea
          className="min-h-[220px]"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Content"
        />

        {err ? <div className="text-sm text-red-600">{err}</div> : null}

        <button className="btn disabled:opacity-60" disabled={loading} onClick={create}>
          {loading ? "Creating..." : "Create"}
        </button>
      </div>
    </main>
  );
}