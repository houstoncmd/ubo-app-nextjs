import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api-client";

// Generic API proxy route - forwards all requests to FastAPI backend
// This is a catch-all for any API routes not handled by specific route files.
// URL pattern: /api/proxy/[...path] -> http://backend:8000/api/[...path]

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = `/api/${params.path.join("/")}`;
  return proxyToBackend(path, request, { method: "GET" });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = `/api/${params.path.join("/")}`;
  return proxyToBackend(path, request, { method: "POST" });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = `/api/${params.path.join("/")}`;
  return proxyToBackend(path, request, { method: "PUT" });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = `/api/${params.path.join("/")}`;
  return proxyToBackend(path, request, { method: "DELETE" });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = `/api/${params.path.join("/")}`;
  return proxyToBackend(path, request, { method: "PATCH" });
}
