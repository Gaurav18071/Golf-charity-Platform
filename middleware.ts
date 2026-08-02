import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/src/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabase, response } = await updateSession(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Public auth pages (redirect logged-in users away from these)
  const authRoutes = ["/login", "/signup"];

  // Protected pages (redirect unauthenticated users to /login)
  const protectedRoutes = [
    "/dashboard",
    "/profile",
    "/admin",
    "/campaigns",
    "/donations",
    "/subscribers",
    "/analytics",
    "/settings",
    "/organizer",
    "/notifications",
    "/support",
  ];

  const isAuthRoute = authRoutes.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Unauthenticated user trying to access a protected route → redirect to /login
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Authenticated user trying to access login/signup → redirect to /dashboard
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/campaigns/:path*",
    "/donations/:path*",
    "/subscribers/:path*",
    "/analytics/:path*",
    "/settings/:path*",
    "/organizer/:path*",
    "/notifications/:path*",
    "/support/:path*",
    "/login",
    "/signup",
  ],
};