type JsonRecord = Record<string, unknown>;

const DEFAULT_API_URL = "https://now-play-backend-production.up.railway.app";

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
  const candidatePaths = path.endsWith("/") ? [path, path.replace(/\/$/, "")] : [path, `${path}/`];

  let lastError: Error | null = null;

  for (const candidatePath of candidatePaths) {
    const response = await fetch(buildUrl(candidatePath), {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
    });

    if (response.ok) {
      const text = await response.text();
      if (!text) return null as T;

      try {
        return JSON.parse(text) as T;
      } catch {
        return text as T;
      }
    }

    lastError = new Error(await parseErrorMessage(response));
    if (response.status !== 404) {
      throw lastError;
    }
  }

  throw lastError ?? new Error("Request failed");
}

export async function requestMagicLink(email: string) {
  return requestJson<{ detail?: string }>('/api/auth/magic-link/', {
    method: "POST",
    body: JSON.stringify({ email }),
    headers: {
      Accept: "application/json",
    },
  });
}

export async function verifyMagicLink(token: string) {
  return requestJson<{ access: string; refresh: string; is_new_user: boolean }>('/api/auth/verify-magic-link/', {
    method: "POST",
    body: JSON.stringify({ token }),
    headers: {
      Accept: "application/json",
    },
  });
}

//login and register with password functions

export async function loginWithPassword(email: string, password: string) {
  const res = await fetch(`${getBaseUrl()}/api/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  // 1. Check the content type before parsing
  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await res.text();
    console.error("Backend returned HTML instead of JSON:", text.substring(0, 100));
    throw new Error("Server returned an invalid response. Please check your API URL.");
  }

  // 2. Now it's safe to parse as JSON
  const data = await res.json();

  if (!res.ok) {
    if (data.detail === "Unable to log in with provided credentials.") {
      throw new Error("Please verify your email first. Check your inbox.");
    }
    throw new Error(data.detail || data.non_field_errors?.[0] || "Login failed.");
  }

  return data;
}

export async function registerWithPassword(email: string, password: string): Promise<{
  detail: string;
}> {
  const res = await fetch(`${getBaseUrl()}/api/auth/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }), // Add other fields if your serializer requires them
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || error.email?.[0] || 'Registration failed.');
  }

  return res.json();
}