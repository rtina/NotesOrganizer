"use client";

import Link from "next/link";

type NoteCardProps = {
  note: {
    id: string;
    title: string;
    dayKey: string;
    visibility: "PRIVATE" | "PUBLIC" | "UNLISTED";
    updatedAt?: string;
  };
  onDelete?: (id: string) => void;
};

export default function NoteCard({ note, onDelete }: NoteCardProps) {
  return (
    <div className="card note-card">
      <div>
        <Link className="note-title font-semibold hover:underline" href={`/notes/${note.id}`}>
          {note.title}
        </Link>
        <div className="note-meta mt-1">
          <span>{note.dayKey}</span>
          <span>-</span>
          <span>{note.visibility}</span>
        </div>
      </div>

      {onDelete ? (
        <button className="btn-danger note-delete text-sm" onClick={() => onDelete(note.id)}>
          <span className="note-delete-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="img" focusable="false">
              <path
                fill="currentColor"
                d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9z"
              />
            </svg>
          </span>
          <span>Delete</span>
        </button>
      ) : null}
    </div>
  );
}
