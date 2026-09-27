import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

// Using the edge-compatible auth configuration
const { auth } = NextAuth(authConfig);

const PROTECTED_ROUTES = [
  "/dashboard",
  "/methods",
  "/journal",
  "/evaluation",
  "/news",
];

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session;

  const isProtected = PROTECTED_ROUTES.some(
    (route) =>
      nextUrl.pathname === route || nextUrl.pathname.startsWith(route + "/")
  );

  // Fallback / Redirect for unauthenticated users accessing private routes
  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect logged-in users away from root landing page
  if (nextUrl.pathname === "/" && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  // Define matcher exactly as requested to exclude API auth, static assets, images, etc.
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons).*)",
  ],
};
