import { NextRequest, NextResponse } from "next/server";

// API proxy route - forwards all requests to FastAPI backend
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, "GET");
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, "POST");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, "PUT");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, "DELETE");
}

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const path = pathSegments.join("/");

  try {
    const url = new URL(`/api/${path}`, apiUrl);
    url.search = request.nextUrl.search;

    const init: RequestInit = {
      method,
      headers: {
        "Content-Type": request.headers.get("Content-Type") || "application/json",
        Cookie: request.headers.get("cookie") || "",
        Authorization: request.headers.get("authorization") || "",
      },
    };

    if (method !== "GET" && method !== "DELETE") {
      init.body = await request.text();
    }

    const response = await fetch(url.toString(), init);
    const data = await response.text();

    return new NextResponse(data, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Backend service unavailable", status: 503 },
      { status: 503 }
    );
  }
}
