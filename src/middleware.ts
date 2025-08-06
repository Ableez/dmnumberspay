import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "./lib/auth/session";

// Route definitions
const publicRoutes = ["/about", "/help"];
const authRoutes = ["/sign-in", "/sign-up", "/onboard"];

// Color codes for console logs
const colors = {
  info: "\x1b[36m%s\x1b[0m", // Cyan
  success: "\x1b[32m%s\x1b[0m", // Green
  warning: "\x1b[33m%s\x1b[0m", // Yellow
  error: "\x1b[31m%s\x1b[0m", // Red
  highlight: "\x1b[35m%s\x1b[0m", // Magenta
};

export default async function middleware(req: NextRequest) {
  // console.log(colors.highlight, "🔄 Middleware Execution Started");
  // console.log(colors.info, `📍 Request Path: ${req.nextUrl.pathname}`);

  // Get current path and determine route type
  const path = req.nextUrl.pathname;

  // Check if the current path is public or auth-related
  const isPublicRoute = publicRoutes.some(
    (route) => path === route || path.startsWith(route),
  );

  const isAuthRoute = authRoutes.some(
    (route) => path === route || path.startsWith(route),
  );

  // console.log(colors.info, `🔓 Public Route: ${isPublicRoute}`);
  // console.log(colors.info, `🔑 Auth Route: ${isAuthRoute}`);

  // Get and validate the session cookie only
  const sessionCookie = (await cookies()).get("session")?.value;
  let isAuthenticated = false;

  if (sessionCookie) {
    // console.log(colors.success, "✅ Session cookie found");

    try {
      // Simply decrypt the session payload and check if userId exists
      const payload = await decrypt(sessionCookie);

      if (payload?.userId) {
        // console.log(
        //   colors.success,
        //   `✅ Session valid for user: ${String(payload.userId)}`,
        // );
        isAuthenticated = true;
      } else {
        // console.log(colors.warning, "⚠️ Invalid session payload format");
      }
    } catch (error) {
      // console.log(colors.error, `❌ Session verification error: ${error}`);
    }
  } else {
    // console.log(colors.warning, "⚠️ No session cookie found");
  }

  // Handle routing logic
  if (!isPublicRoute && !isAuthRoute && !isAuthenticated) {
    // Redirect unauthenticated users to sign-in
    // console.log(colors.error, "🚫 Access denied to protected route");
    return NextResponse.redirect(new URL("/sign-in", req.nextUrl));
  }

  if (isAuthRoute && isAuthenticated) {
    // Redirect authenticated users away from auth pages
    // console.log(
    //   colors.success,
    //   "🔄 User already authenticated, redirecting from auth page",
    // );
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // console.log(colors.success, "✅ Middleware check passed");
  return NextResponse.next();
}

// Routes Middleware should not run on - expanded for web resources
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.webp$|.*\\.ico$|\
favicon.ico|manifest.json|manifest.webmanifest|site.webmanifest|.*\\.webmanifest$|\
sw.js|workbox-*.js|worker-*.js|robots.txt|sitemap.xml|.*\\.json$).*)",
  ],
};
