export type ApiKeyScope =
  | "admin"
  | "x402:quote"
  | "x402:settle"
  | "agents:read"
  | "agents:write";
export type ApiKeyTier = "free" | "pro" | "admin";

export interface ApiKeyRecord {
  id: string;
  name: string;
  keyHash: string;
  prefix: string;
  scopes: ApiKeyScope[];
  tier: ApiKeyTier;
  createdAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  lastUsedAt: string | null;
  requestCount: number;
}
export interface ApiKeyValidation {
  ok: boolean;
  status: number;
  error?: string;
  record?: ApiKeyRecord;
  isAdmin: boolean;
  tier: ApiKeyTier | "anonymous";
  scopes: ApiKeyScope[];
}

type AuthGlobal = typeof globalThis & {
  __openStellarApiKeys__?: Map<string, ApiKeyRecord>;
  __openStellarAdminKey__?: string;
};
const globalState = globalThis as AuthGlobal;
const keyStore =
  globalState.__openStellarApiKeys__ ?? new Map<string, ApiKeyRecord>();
if (!globalState.__openStellarApiKeys__)
  globalState.__openStellarApiKeys__ = keyStore;
const encoder = new TextEncoder();

function base64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}
async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return base64Url(new Uint8Array(digest));
}
export function generateApiKey(prefix = "osk_live"): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return `${prefix}_${base64Url(bytes)}`;
}
export function getAdminApiKey(): string {
  if (process.env.ADMIN_API_KEY) return process.env.ADMIN_API_KEY;
  if (!globalState.__openStellarAdminKey__) {
    globalState.__openStellarAdminKey__ = generateApiKey("osk_admin");
    console.warn(
      "ADMIN_API_KEY is not configured; generated an ephemeral admin key for this runtime.",
    );
  }
  return globalState.__openStellarAdminKey__;
}
export function extractApiKey(req: Request): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7).trim();
  return new URL(req.url).searchParams.get("apiKey");
}
export async function createServiceApiKey(input: {
  name: string;
  scopes: ApiKeyScope[];
  expiresAt?: string | null;
  tier?: Exclude<ApiKeyTier, "admin">;
}): Promise<{ key: string; record: ApiKeyRecord }> {
  const key = generateApiKey();
  const id = `key_${base64Url(crypto.getRandomValues(new Uint8Array(9)))}`;
  const now = new Date().toISOString();
  const record: ApiKeyRecord = {
    id,
    name: input.name.trim(),
    keyHash: await sha256(key),
    prefix: `${key.slice(0, 13)}…`,
    scopes: [...new Set(input.scopes)],
    tier: input.tier ?? "free",
    createdAt: now,
    expiresAt: input.expiresAt ?? null,
    revokedAt: null,
    lastUsedAt: null,
    requestCount: 0,
  };
  keyStore.set(record.id, record);
  return { key, record };
}
export function listApiKeys(): ApiKeyRecord[] {
  return [...keyStore.values()].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}
export function revokeApiKey(id: string): ApiKeyRecord | null {
  const record = keyStore.get(id);
  if (!record) return null;
  record.revokedAt = new Date().toISOString();
  return record;
}
export async function rotateApiKey(
  id: string,
): Promise<{ key: string; record: ApiKeyRecord } | null> {
  const record = keyStore.get(id);
  if (!record) return null;
  const key = generateApiKey();
  record.keyHash = await sha256(key);
  record.prefix = `${key.slice(0, 13)}…`;
  record.revokedAt = null;
  record.lastUsedAt = null;
  return { key, record };
}
export async function validateApiKey(
  req: Request,
  requiredScopes: ApiKeyScope[] = [],
): Promise<ApiKeyValidation> {
  const key = extractApiKey(req);
  if (!key)
    return {
      ok: false,
      status: 401,
      error: "missing_api_key",
      isAdmin: false,
      tier: "anonymous",
      scopes: [],
    };
  if (key === getAdminApiKey())
    return {
      ok: true,
      status: 200,
      isAdmin: true,
      tier: "admin",
      scopes: ["admin"],
    };
  const hash = await sha256(key);
  const record =
    [...keyStore.values()].find((candidate) => candidate.keyHash === hash) ??
    null;
  if (!record)
    return {
      ok: false,
      status: 401,
      error: "invalid_api_key",
      isAdmin: false,
      tier: "anonymous",
      scopes: [],
    };
  if (record.revokedAt)
    return {
      ok: false,
      status: 403,
      error: "key_revoked",
      isAdmin: false,
      tier: record.tier,
      scopes: record.scopes,
    };
  if (record.expiresAt && new Date(record.expiresAt).getTime() < Date.now())
    return {
      ok: false,
      status: 403,
      error: "key_expired",
      isAdmin: false,
      tier: record.tier,
      scopes: record.scopes,
    };
  const missing = requiredScopes.filter(
    (scope) => !record.scopes.includes(scope),
  );
  if (missing.length > 0)
    return {
      ok: false,
      status: 403,
      error: "insufficient_scope",
      record,
      isAdmin: false,
      tier: record.tier,
      scopes: record.scopes,
    };
  record.lastUsedAt = new Date().toISOString();
  record.requestCount += 1;
  return {
    ok: true,
    status: 200,
    record,
    isAdmin: false,
    tier: record.tier,
    scopes: record.scopes,
  };
}
export async function requireAdminApiKey(
  req: Request,
): Promise<ApiKeyValidation> {
  const validation = await validateApiKey(req, ["admin"]);
  if (validation.isAdmin) return validation;
  return {
    ...validation,
    ok: false,
    status: validation.status === 200 ? 403 : validation.status,
    error: validation.error ?? "admin_key_required",
  };
}
export function resetApiKeyStore(): void {
  keyStore.clear();
  globalState.__openStellarAdminKey__ = undefined;
}
