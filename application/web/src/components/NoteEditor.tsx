"use client";

import { useEffect, useState } from "react";

export default function NoteEditor({
  title,
  content,
  onSave,
  onCancel,
}: {
  title: string;
  content: string;
  onSave: (next: { title: string; content: string }) => Promise<void>;
  onCancel?: () => void;
}) {
  const [t, setT] = useState(title);
  const [c, setC] = useState(content);
  const [saving, setSaving] = useState(false);

  // Keep local state in sync if the parent note changes
  useEffect(() => {
    setT(title);
    setC(content);
  }, [title, content]);

  async function handleSave() {
    if (!t.trim() && !c.trim()) return;
    setSaving(true);
    try {
      await onSave({ title: t, content: c });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card note-editor">
      <div className="note-editor-header">
        <input
          className="input text-lg note-editor-title-input"
          value={t}
          onChange={(e) => setT(e.target.value)}
          placeholder="Untitled note"
        />
        <p className="text-sm text-muted">Edit your title and content, then save your changes.</p>
      </div>

      <textarea
        className="note-editor-textarea"
        value={c}
        onChange={(e) => setC(e.target.value)}
        placeholder="Start writing your thoughts, tasks, or ideas..."
      />

      <div className="note-editor-toolbar">
        {onCancel ? (
          <button
            type="button"
            className="btn-ghost text-sm"
            disabled={saving}
            onClick={onCancel}
          >
            Cancel
          </button>
        ) : null}
        <button
          type="button"
          className="btn text-sm disabled:opacity-60"
          disabled={saving}
          onClick={handleSave}
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </section>
  );
}