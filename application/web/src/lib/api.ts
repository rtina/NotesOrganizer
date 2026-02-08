const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE) throw new Error("Missing NEXT_PUBLIC_API_BASE_URL in .env.local");

type ApiOptions = RequestInit & { json?: any };

export async function api<T = any>(path: string, options: ApiOptions = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.json ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
    body: options.json ? JSON.stringify(options.json) : options.body,
    credentials: "include",
  });

  const text = await res.text();
  const data = text ? safeJson(text) : {};

  if (!res.ok) {
    const msg = (data as any)?.error || (data as any)?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data as T;
}

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}