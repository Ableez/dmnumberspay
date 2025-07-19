import { type NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};

export default async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Define public routes that don't require authentication
  const isPublicRoute = [
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/reset-password",
    "/onboard",
  ].includes(path);

  // Get the user_session from cookies
  const userSession = request.cookies.get("user_session")?.value;

  // If we're on a public route (like sign-in) and already have a session,
  // redirect to main page - UNLESS it's the onboard route which is allowed
  // with a session
  if (isPublicRoute && userSession && path !== "/onboard") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If we're NOT on a public route and don't have a session,
// redirect to sign-in
  if (!isPublicRoute && !userSession) {
    // Store the original URL to redirect back after authentication
    const redirectUrl = new URL("/sign-in", request.url);

    return NextResponse.redirect(redirectUrl);
  }

  // Continue with the request
  return NextResponse.next();
}
