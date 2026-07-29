type JsonRecord = Record<string, unknown>;

const DEFAULT_API_URL = "http://localhost:8000";

function getBaseUrl() {
  const configuredUrl = (
    (import.meta.env.VITE_API_URL as string | undefined) ??
    (typeof process !== "undefined" ? (process.env.REACT_APP_API_URL as string | undefined) : undefined) ??
    DEFAULT_API_URL
  )?.trim();

  if (!configuredUrl) return DEFAULT_API_URL;
  if (/^https?:\/\//i.test(configuredUrl)) return configuredUrl.replace(/\/$/, "");
  return `https://${configuredUrl.replace(/\/$/, "")}`;
}

function buildUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getBaseUrl()}${normalizedPath}`;
}

async function parseErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as JsonRecord;
    return (payload.detail as string | undefined) ?? (payload.message as string | undefined) ?? (payload.error as string | undefined) ?? response.statusText;
  } catch {
    return response.statusText || "Request failed";
  }
}

async function requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(buildUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const text = await response.text();
  if (!text) return null as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}

export async function requestMagicLink(email: string) {
  return requestJson<{ detail?: string }>('/api/accounts/auth/magic-link/', {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyMagicLink(token: string) {
  return requestJson<{ access: string; refresh: string; is_new_user: boolean }>('/api/accounts/auth/verify-magic-link/', {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}
