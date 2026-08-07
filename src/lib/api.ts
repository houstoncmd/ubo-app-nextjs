export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ApiResponse<T = unknown> {
  data: T | null;
  error: string | null;
  status: number;
}

export async function apiProxy<T = unknown>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${path}`;
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (!res.ok) {
      return {
        data: null,
        error: `API Error: ${res.status} ${res.statusText}`,
        status: res.status,
      };
    }

    const data = await res.json();
    return { data, error: null, status: res.status };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Network error",
      status: 0,
    };
  }
}
