"use client";

import { useMemo, useState } from "react";

type Visibility = "PRIVATE" | "PUBLIC" | "UNLISTED";

export default function VisibilitySelect({
  visibility,
  publicUrl,
  shareUrl,
  onChange,
}: {
  visibility: Visibility;
  publicUrl?: string | null;
  shareUrl?: string | null;
  onChange: (v: Visibility) => Promise<void>;
}) {
  const [v, setV] = useState<Visibility>(visibility);
  const [loading, setLoading] = useState(false);

  const link = useMemo(() => {
    if (v === "PUBLIC") return publicUrl;
    if (v === "UNLISTED") return shareUrl;
    return null;
  }, [v, publicUrl, shareUrl]);

  async function apply(next: Visibility) {
    setV(next);
    setLoading(true);
    try {
      await onChange(next);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card soft space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium">Visibility</label>
        <select value={v} disabled={loading} onChange={(e) => apply(e.target.value as Visibility)}>
          <option value="PRIVATE">PRIVATE</option>
          <option value="PUBLIC">PUBLIC</option>
          <option value="UNLISTED">UNLISTED</option>
        </select>
        {loading ? <span className="text-sm text-muted">Updating...</span> : null}
      </div>

      {link ? (
        <div className="text-sm">
          <div className="text-muted">Share link:</div>
          <a className="break-all" href={link} target="_blank" rel="noreferrer">
            {link}
          </a>
        </div>
      ) : (
        <div className="text-sm text-muted">Only you can access this note.</div>
      )}
    </div>
  );
}
