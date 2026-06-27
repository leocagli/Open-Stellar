import type { Metadata } from "next";
import { listApiKeys } from "@/lib/auth/api-keys";

export const metadata: Metadata = {
  title: "API Keys | Open Stellar Admin",
  description:
    "Create, revoke, rotate, and audit scoped Open Stellar service API keys.",
};

export default function AdminKeysPage() {
  const keys = listApiKeys();

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <section className="mx-auto max-w-6xl space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
            Admin
          </p>
          <h1 className="mt-2 text-3xl font-semibold">API key management</h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Manage scoped service keys for public integrations. Use the admin
            key in an Authorization bearer header to create, revoke, or rotate
            keys.
          </p>
        </div>
        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5 text-sm text-cyan-100">
          <code>POST /api/admin/keys</code> with{" "}
          <code>{`{ "name": "my-integration", "scopes": ["x402:quote"] }`}</code>
          . The raw key is only returned once.
        </div>
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/10 text-slate-300">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Scopes</th>
                <th className="p-4">Last used</th>
                <th className="p-4">Requests</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {keys.length === 0 ? (
                <tr>
                  <td className="p-4 text-slate-400" colSpan={5}>
                    No service keys have been created yet.
                  </td>
                </tr>
              ) : (
                keys.map((key) => (
                  <tr className="border-t border-white/10" key={key.id}>
                    <td className="p-4">
                      <div className="font-medium">{key.name}</div>
                      <div className="text-xs text-slate-500">
                        {key.id} · {key.prefix}
                      </div>
                    </td>
                    <td className="p-4">{key.scopes.join(", ")}</td>
                    <td className="p-4">{key.lastUsedAt ?? "Never"}</td>
                    <td className="p-4">{key.requestCount}</td>
                    <td className="p-4">
                      {key.revokedAt
                        ? "Revoked"
                        : key.expiresAt && new Date(key.expiresAt) < new Date()
                          ? "Expired"
                          : "Active"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
