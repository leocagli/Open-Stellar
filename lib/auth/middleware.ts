import { NextResponse, type NextRequest } from "next/server";
import {
  extractApiKey,
  validateApiKey,
  type ApiKeyScope,
  type ApiKeyTier,
} from "@/lib/auth/api-keys";
import { checkRateLimit, type RateLimitConfig } from "@/lib/rate-limit";

const tierLimits: Record<ApiKeyTier | "anonymous", RateLimitConfig | null> = {
  anonymous: { maxRequests: 10, windowMs: 60_000 },
  free: { maxRequests: 60, windowMs: 60_000 },
  pro: { maxRequests: 600, windowMs: 60_000 },
  admin: null,
};
function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}
function requiredScopes(req: NextRequest): ApiKeyScope[] {
  const path = req.nextUrl.pathname;
  if (path.startsWith("/api/admin/")) return ["admin"];
  if (path === "/api/protocol/x402/quote") return ["x402:quote"];
  if (path === "/api/protocol/x402/settle") return ["x402:settle"];
  if (path.startsWith("/api/agents/"))
    return req.method === "GET" ? ["agents:read"] : ["agents:write"];
  return [];
}
function rateLimitKey(
  req: NextRequest,
  tier: ApiKeyTier | "anonymous",
): string {
  return `api:${tier}:${extractApiKey(req)?.slice(0, 18) || clientIp(req)}`;
}
export async function applyApiAuth(
  req: NextRequest,
): Promise<NextResponse | null> {
  const path = req.nextUrl.pathname;
  if (path.startsWith("/admin")) {
    const validation = await validateApiKey(req, ["admin"]);
    if (!validation.isAdmin)
      return NextResponse.json(
        { ok: false, error: validation.error ?? "admin_key_required" },
        { status: validation.status === 200 ? 403 : validation.status },
      );
    return null;
  }
  if (!path.startsWith("/api/")) return null;
  const scopes = requiredScopes(req);
  const hasKey = Boolean(extractApiKey(req));
  const validation = hasKey
    ? await validateApiKey(req, scopes)
    : {
        ok: scopes.length === 0,
        tier: "anonymous" as const,
        status: 200,
        error: undefined,
      };
  if (!validation.ok)
    return NextResponse.json(
      { ok: false, error: validation.error ?? "unauthorized" },
      { status: validation.status },
    );
  const limit = tierLimits[validation.tier];
  if (limit) {
    const result = checkRateLimit(rateLimitKey(req, validation.tier), limit);
    if (!result.allowed)
      return NextResponse.json(
        { ok: false, error: "rate_limit_exceeded" },
        {
          status: 429,
          headers: { "Retry-After": String(result.retryAfterSeconds) },
        },
      );
  }
  return null;
}
