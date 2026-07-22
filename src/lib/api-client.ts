const DEFAULT_API_URL = "http://localhost:8000";

const AUTH_STORAGE_KEYS = {
  access: "npc.accessToken",
  refresh: "npc.refreshToken",
} as const;

function getBaseUrl() {
  return (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, "");
}

function getStorage() {
  return typeof window === "undefined" ? null : window.localStorage;
}

export function getAccessToken() {
  return getStorage()?.getItem(AUTH_STORAGE_KEYS.access);
}

export function setAuthTokens(access: string, refresh: string) {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(AUTH_STORAGE_KEYS.access, access);
  storage.setItem(AUTH_STORAGE_KEYS.refresh, refresh);
}

export function clearAuthTokens() {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(AUTH_STORAGE_KEYS.access);
  storage.removeItem(AUTH_STORAGE_KEYS.refresh);
}

async function parseJson<T>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getStorage()?.getItem(AUTH_STORAGE_KEYS.refresh);
  if (!refreshToken) return false;
  try {
    const payload = await request<{ access?: string; refresh?: string }>({
      path: "/api/auth/refresh/",
      method: "POST",
      body: JSON.stringify({ refresh: refreshToken }),
      retry: false,
    });
    if (payload?.access) {
      setAuthTokens(payload.access, payload.refresh || refreshToken);
      return true;
    }
  } catch {
    // noop
  }
  clearAuthTokens();
  return false;
}

async function request<T>({
  path,
  method = "GET",
  body,
  headers,
  retry = true,
}: {
  path: string;
  method?: string;
  body?: BodyInit | Record<string, unknown>;
  headers?: HeadersInit;
  retry?: boolean;
}): Promise<T> {
  const url = `${getBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const requestHeaders = new Headers(headers);
  const accessToken = getAccessToken();

  if (accessToken && !requestHeaders.has("Authorization")) {
    requestHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  const hasBody = body !== undefined;
  if (hasBody && !(body instanceof FormData) && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: hasBody
      ? body instanceof FormData || typeof body === "string"
        ? body
        : JSON.stringify(body)
      : undefined,
  });

  if (response.status === 401 && retry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return request<T>({ path, method, body, headers, retry: false });
    }
    clearAuthTokens();
    throw new Error("Session expired");
  }

  if (!response.ok) {
    const payload = await parseJson<{ detail?: string; message?: string; error?: string }>(response);
    throw new Error(payload?.detail || payload?.message || payload?.error || response.statusText || "Request failed");
  }

  return (await parseJson<T>(response)) as T;
}

export const apiClient = {
  get<T>(path: string) {
    return request<T>({ path, method: "GET" });
  },
  post<T>(path: string, body?: BodyInit | Record<string, unknown>) {
    return request<T>({ path, method: "POST", body });
  },
  put<T>(path: string, body?: BodyInit | Record<string, unknown>) {
    return request<T>({ path, method: "PUT", body });
  },
  delete<T>(path: string) {
    return request<T>({ path, method: "DELETE" });
  },
};
