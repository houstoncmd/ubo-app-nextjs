/**
 * Server-side API client for proxying requests to the FastAPI backend.
 * Used in Next.js API route handlers (server components).
 * Forwards session cookies for authenticated requests.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ApiResponse<T = unknown> {
  data: T | null;
  error: string | null;
  status: number;
}

/**
 * Build headers to forward from client request to FastAPI backend.
 * Includes cookies and any existing authorization headers.
 */
export function buildForwardHeaders(
  incomingHeaders: Headers,
  extra?: Record<string, string>
): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...extra,
  };

  // Forward cookies (session_id) from the browser to the backend
  const cookie = incomingHeaders.get("cookie");
  if (cookie) {
    headers["Cookie"] = cookie;
  }

  // Forward authorization header if present
  const auth = incomingHeaders.get("authorization");
  if (auth) {
    headers["Authorization"] = auth;
  }

  return headers;
}

/**
 * Proxy a request to the FastAPI backend.
 * Returns a NextResponse with the backend response forwarded.
 */
export async function proxyToBackend(
  path: string,
  request: Request,
  options?: {
    method?: string;
    body?: string;
    extraHeaders?: Record<string, string>;
  }
): Promise<Response> {
  const url = new URL(path, API_BASE_URL);

  // Forward query parameters
  const incomingUrl = new URL(request.url);
  url.search = incomingUrl.search;

  const method = options?.method || request.method;
  const init: RequestInit = {
    method,
    headers: buildForwardHeaders(request.headers, options?.extraHeaders),
    redirect: "manual", // Don't follow redirects — capture Set-Cookie from 303
  };

  if (method !== "GET" && method !== "DELETE") {
    init.body = options?.body ?? await request.text();
  }

  try {
    const response = await fetch(url.toString(), init);
    const data = await response.text();

    // Build response headers, forwarding Set-Cookie from backend
    const responseHeaders: Record<string, string> = {
      "Content-Type":
        response.headers.get("Content-Type") || "application/json",
    };

    // Forward Set-Cookie headers from backend (for session management)
    const setCookies = response.headers.getSetCookie?.() || [];
    if (setCookies.length > 0) {
      responseHeaders["Set-Cookie"] = setCookies.join(", ");
    } else {
      const setCookie = response.headers.get("Set-Cookie");
      if (setCookie) {
        responseHeaders["Set-Cookie"] = setCookie;
      }
    }

    return new Response(data, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error(`Proxy error for ${path}:`, error);
    return new Response(
      JSON.stringify({
        error: "Backend service unavailable",
        detail: String(error),
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * Client-side fetch wrapper that sends credentials (cookies) to Next.js API routes.
 * Use this in "use client" components.
 */
export async function apiFetch<T = unknown>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(path, {
      credentials: "include", // send cookies with client-side requests
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return {
        data: null,
        error: body.detail || body.error || `API Error: ${res.status} ${res.statusText}`,
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
