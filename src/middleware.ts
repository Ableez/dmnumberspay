import { type NextRequest, NextResponse } from "next/server";

export default async function middleware(request: NextRequest) {
  const sessionId = request.cookies.get("sessionId");

  if (!sessionId) {
    // No active session, redirect to login or handle accordingly
    NextResponse.redirect(new URL("/sign-in", request.nextUrl));
  }
  // Session exists, continue
  return NextResponse.next();
}
