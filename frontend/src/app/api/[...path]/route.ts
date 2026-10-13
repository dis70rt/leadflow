import { NextRequest, NextResponse } from "next/server";

const allowedPath = /^v1\/leads(?:\/[0-9a-f-]{36}(?:\/discussions)?)?$/i;

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const endpoint = path.join("/");
  if (!allowedPath.test(endpoint))
    return NextResponse.json(
      { error: { code: "not_found", message: "Endpoint not found" } },
      { status: 404 },
    );
  const base = process.env.API_BASE_URL ?? "http://127.0.0.1:8000";
  try {
    const upstream = await fetch(
      `${base}/api/${endpoint}${request.nextUrl.search}`,
      {
        method: request.method,
        headers: { "Content-Type": "application/json" },
        body: request.method === "GET" ? undefined : await request.text(),
        signal: AbortSignal.timeout(15000),
        cache: "no-store",
      },
    );
    const headers = new Headers({
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    });
    const location = upstream.headers.get("Location");
    if (location) headers.set("Location", location);
    return new NextResponse(await upstream.text(), {
      status: upstream.status,
      headers,
    });
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "backend_unavailable",
          message:
            "We couldn’t reach your workspace. Check that the backend is running.",
        },
      },
      { status: 503 },
    );
  }
}

export { proxy as GET, proxy as POST, proxy as PATCH };
