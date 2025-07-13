import { NextRequest, NextResponse } from "next/server";

export default function middleware(request: NextRequest) {
  const sessionId = request.cookies.get("sessionId");
  if (!sessionId) {
    // No active session, redirect to login or handle accordingly
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  // Session exists, continue
  return NextResponse.next();
}
