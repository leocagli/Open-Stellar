import { NextResponse } from "next/server";
import {
  createServiceApiKey,
  listApiKeys,
  type ApiKeyScope,
} from "@/lib/auth/api-keys";

const validScopes = new Set<ApiKeyScope>([
  "x402:quote",
  "x402:settle",
  "agents:read",
  "agents:write",
]);

export async function GET() {
  return NextResponse.json(
    { ok: true, keys: listApiKeys() },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const scopes = Array.isArray(body.scopes)
    ? body.scopes.filter(
        (scope: unknown): scope is ApiKeyScope =>
          typeof scope === "string" && validScopes.has(scope as ApiKeyScope),
      )
    : [];
  const expiresAt =
    typeof body.expiresAt === "string" && body.expiresAt
      ? new Date(body.expiresAt).toISOString()
      : null;
  const tier = body.tier === "pro" ? "pro" : "free";

  if (!name)
    return NextResponse.json(
      { ok: false, error: "name_required" },
      { status: 400 },
    );
  if (scopes.length === 0)
    return NextResponse.json(
      { ok: false, error: "scope_required" },
      { status: 400 },
    );

  const { key, record } = await createServiceApiKey({
    name,
    scopes,
    expiresAt,
    tier,
  });
  return NextResponse.json(
    { ok: true, key, id: record.id, record },
    { status: 201, headers: { "Cache-Control": "no-store" } },
  );
}
