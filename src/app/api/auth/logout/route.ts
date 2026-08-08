import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api-client";

/**
 * POST /api/auth/logout
 * Proxies logout to FastAPI backend: POST /api/auth/logout
 */
export async function POST(request: NextRequest) {
  return proxyToBackend("/api/auth/logout", request, {
    method: "POST",
  });
}
