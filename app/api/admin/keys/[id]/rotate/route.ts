import { NextResponse } from "next/server";
import { rotateApiKey } from "@/lib/auth/api-keys";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_req: Request, context: RouteContext) {
  const { id } = await context.params;
  const result = await rotateApiKey(decodeURIComponent(id));
  if (!result)
    return NextResponse.json(
      { ok: false, error: "key_not_found" },
      { status: 404 },
    );
  return NextResponse.json(
    { ok: true, key: result.key, record: result.record },
    { headers: { "Cache-Control": "no-store" } },
  );
}
