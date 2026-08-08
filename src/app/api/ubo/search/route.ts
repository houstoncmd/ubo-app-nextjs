import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api-client";

/**
 * POST /api/ubo/search
 * Proxies UBO search to FastAPI backend: POST /api/ubo/search
 */
export async function POST(request: NextRequest) {
  return proxyToBackend("/api/ubo/search", request, {
    method: "POST",
  });
}

/**
 * GET /api/ubo/search
 * Proxies UBO search GET requests to FastAPI backend.
 */
export async function GET(request: NextRequest) {
  return proxyToBackend("/api/ubo/search", request, {
    method: "GET",
  });
}
