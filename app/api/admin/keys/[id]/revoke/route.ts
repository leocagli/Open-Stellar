import { NextResponse } from "next/server";
import { revokeApiKey } from "@/lib/auth/api-keys";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_req: Request, context: RouteContext) {
  const { id } = await context.params;
  const record = revokeApiKey(decodeURIComponent(id));
  if (!record)
    return NextResponse.json(
      { ok: false, error: "key_not_found" },
      { status: 404 },
    );
  return NextResponse.json(
    { ok: true, record },
    { headers: { "Cache-Control": "no-store" } },
  );
}
