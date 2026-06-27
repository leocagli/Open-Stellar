import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { applyApiAuth } from "@/lib/auth/middleware";

export async function middleware(req: NextRequest) {
  const authResponse = await applyApiAuth(req);
  if (authResponse) return authResponse;
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*"],
};
