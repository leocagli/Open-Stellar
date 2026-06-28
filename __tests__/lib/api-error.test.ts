import { describe, expect, it } from "vitest"

import { apiError } from "@/lib/api/error"

describe("apiError", () => {
  it("returns the standard error response shape with status and code", async () => {
    const response = apiError("not found", "NOT_FOUND", 404)

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "not found",
      code: "NOT_FOUND",
    })
  })
})
