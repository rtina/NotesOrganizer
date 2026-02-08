"use client";

import { useState } from "react";
import { api } from "@/lib/api";

type FileRow = {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
};

export default function FileUploader({
  noteId,
  files,
  onUploaded,
}: {
  noteId: string;
  files: FileRow[];
  onUploaded: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ url: string; mimeType: string; fileName: string } | null>(null);
  const [previewError, setPreviewError] = useState(false);

  async function upload(file: File) {
    setBusy(true);
    setErr(null);
    try {
      await api("/files/upload", {
        method: "POST",
        headers: {
          "X-File-Name": file.name,
          "X-Mime-Type": file.type || "application/octet-stream",
          "X-File-Size": String(file.size),
          ...(noteId ? { "X-Note-Id": noteId } : {}),
        },
        body: file,
      });

      await onUploaded();
    } catch (e: any) {
      setErr(e?.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function previewFile(file: FileRow) {
    const res = await api<{ ok: true; previewUrl: string }>(`/files/${file.id}/preview-url`);
    const mimeType = file.mimeType || "application/octet-stream";
    setPreviewError(false);
    setPreview({ url: res.previewUrl, mimeType, fileName: file.fileName });
  }

  async function remove(fileId: string) {
    await api(`/files/${fileId}`, { method: "DELETE" });
    await onUploaded();
  }

  return (
    <div className="card soft space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="font-semibold">Attachments</div>
        <label className="btn-ghost text-sm cursor-pointer">
          {busy ? "Uploading..." : "Upload file"}
          <input
            type="file"
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
              e.currentTarget.value = "";
            }}
          />
        </label>
      </div>

      {err ? <div className="text-sm text-red-600">{err}</div> : null}

      {files.length === 0 ? (
        <div className="text-sm text-muted">No files yet.</div>
      ) : (
        <div className="space-y-2">
          {files.map((f) => (
            <div key={f.id} className="file-row flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate font-medium">{f.fileName}</div>
                <div className="text-xs text-muted">{f.mimeType}</div>
              </div>
              <div className="flex items-center gap-5">
                <button className="btn-outline text-sm" onClick={() => previewFile(f)}>
                  Preview
                </button>
                <button className="btn-danger file-delete text-sm" onClick={() => remove(f.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {preview ? (
        <div className="preview-modal">
          <div className="preview-backdrop" onClick={() => setPreview(null)} />
          <div className="preview-panel">
            <div className="preview-header">
              <div className="truncate font-semibold">{preview.fileName}</div>
              <button className="btn-ghost text-sm" onClick={() => setPreview(null)}>
                Close
              </button>
            </div>
            {preview.mimeType.startsWith("image/") ? (
              <div className="preview-body image">
                <img src={preview.url} alt={preview.fileName} />
              </div>
            ) : (
              <div className="preview-body frame">
                <iframe
                  className="preview-frame"
                  src={buildPreviewSrc(preview.url, preview.mimeType)}
                  title={preview.fileName}
                  onError={() => setPreviewError(true)}
                />
                {previewError ? (
                  <div className="preview-fallback">
                    <div className="font-semibold">Preview unavailable</div>
                    <div className="text-sm text-muted">
                      This file type can’t be rendered in-app. Try opening it directly.
                    </div>
                    <div className="preview-actions">
                      <a className="btn-outline text-sm" href={preview.url} target="_blank" rel="noreferrer">
                        Open in new tab
                      </a>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function buildPreviewSrc(url: string, mimeType: string) {
  const officeTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.ms-powerpoint",
  ];

  if (officeTypes.includes(mimeType)) {
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
  }

  return url;
}
