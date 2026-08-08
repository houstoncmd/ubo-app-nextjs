import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api-client";

/**
 * GET /api/result/[id]
 * Fetches company result data from FastAPI backend.
 * Proxies to /api/history/{id}/report which returns the full result JSON.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyToBackend(`/api/history/${id}/report`, request, {
    method: "GET",
  });
}
