type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  errors: { field: string; message: string }[];
};

const baseUrl = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
const ACCESS_TOKEN_KEY = "access_token";
const cacheStore = new Map<string, { expiresAt: number; payload: ApiResponse<unknown> }>();

function isSafeMethod(method?: string) {
  return !method || method.toUpperCase() === "GET";
}

function getCookieValue(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  if (!match) return null;
  return decodeURIComponent(match.split("=").slice(1).join("="));
}

export function getCsrfToken() {
  return getCookieValue("csrf_token");
}

function getAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token?: string | null) {
  if (typeof window === "undefined") return;
  if (!token) {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    return;
  }
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken() {
  setAccessToken(null);
}

function buildCacheKey(path: string) {
  return path;
}

export function invalidateCache(prefix?: string) {
  if (!prefix) {
    cacheStore.clear();
    return;
  }
  for (const key of cacheStore.keys()) {
    if (key.startsWith(prefix)) {
      cacheStore.delete(key);
    }
  }
}

async function refreshSession() {
  const response = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: {
      "X-CSRF-Token": getCsrfToken() || ""
    }
  });
  return response.ok;
}

export async function apiRequest<T>(
  path: string,
  options?: RequestInit,
  retry = true
): Promise<ApiResponse<T>> {
  const method = options?.method?.toUpperCase() || "GET";
  const csrfToken = !isSafeMethod(method) ? getCsrfToken() : null;
  const authToken = getAccessToken();
  const extraHeaders =
    options?.headers instanceof Headers
      ? Object.fromEntries(options.headers.entries())
      : Array.isArray(options?.headers)
        ? Object.fromEntries(options.headers)
        : options?.headers;
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...(extraHeaders || {})
      },
      ...options
    });
  } catch {
    throw new Error("errors.network");
  }

  if (!response.ok) {
    if (response.status === 401 && retry && path !== "/api/v1/auth/refresh") {
      const refreshed = await refreshSession();
      if (refreshed) {
        return apiRequest<T>(path, options, false);
      }
    }
    const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;
    const message = payload?.message || "errors.generic";
    throw new Error(message);
  }

  return (await response.json()) as ApiResponse<T>;
}

export async function cachedRequest<T>(
  path: string,
  options?: RequestInit,
  ttlMs = 30000
): Promise<ApiResponse<T>> {
  if (!isSafeMethod(options?.method)) {
    return apiRequest<T>(path, options);
  }
  const key = buildCacheKey(path);
  const cached = cacheStore.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.payload as ApiResponse<T>;
  }
  const payload = await apiRequest<T>(path, options);
  cacheStore.set(key, { expiresAt: Date.now() + ttlMs, payload });
  return payload;
}
