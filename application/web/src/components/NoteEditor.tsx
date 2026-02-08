"use client";

import { useState } from "react";

export default function NoteEditor({
  title,
  content,
  onSave,
}: {
  title: string;
  content: string;
  onSave: (next: { title: string; content: string }) => Promise<void>;
}) {
  const [t, setT] = useState(title);
  const [c, setC] = useState(content);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave({ title: t, content: c });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <input
        className="input text-lg"
        value={t}
        onChange={(e) => setT(e.target.value)}
        placeholder="Title"
      />

      <textarea
        className="min-h-[240px]"
        value={c}
        onChange={(e) => setC(e.target.value)}
        placeholder="Write your notes..."
      />

      <button className="btn disabled:opacity-60" disabled={saving} onClick={handleSave}>
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}