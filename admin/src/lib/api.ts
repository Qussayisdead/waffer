type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  errors: { field: string; message: string }[];
};

const baseUrl = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
  let response: Response;
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options?.headers || {})
      },
      ...options
    });
  } catch {
    throw new Error("errors.network");
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;
    const message = payload?.message || "errors.generic";
    throw new Error(message);
  }

  return (await response.json()) as ApiResponse<T>;
}
