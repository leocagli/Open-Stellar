"use client";

import { useEffect } from "react";

type RouteErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function MapError({ error, reset }: RouteErrorProps) {
  const isDev = process.env.NODE_ENV !== "production";

  useEffect(() => {
    if (isDev) {
      console.error("Map route error", error);
      return;
    }

    void fetch("/api/errors/report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: "route",
        route: "/map",
        message: error.message,
        stack: error.stack,
        digest: error.digest,
      }),
    }).catch(() => {});
  }, [error, isDev]);

  return (
    <div className="p-6">
      <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-5 text-slate-100">
        <h2 className="font-pixel text-lg uppercase text-cyan-200">
          Map unavailable
        </h2>
        <p className="mt-3 text-slate-300">
          This section failed to load. Try again without leaving the app.
        </p>

        {isDev ? (
          <pre className="mt-4 whitespace-pre-wrap text-xs text-rose-300">
            {error.message}
            {"\n"}
            {error.stack}
          </pre>
        ) : null}

        <div className="mt-4 flex gap-3">
          <button onClick={() => reset()}>Try again</button>
          <button onClick={() => window.location.reload()}>Reload page</button>
        </div>
      </div>
    </div>
  );
}
