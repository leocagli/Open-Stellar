import { NextResponse } from "next/server"

export type ApiError = {
  ok: false
  error: string
  code?: string
}

export function apiError(error: string, code?: string, status = 400): NextResponse<ApiError> {
  return NextResponse.json({ ok: false, error, ...(code ? { code } : {}) }, { status })
}
