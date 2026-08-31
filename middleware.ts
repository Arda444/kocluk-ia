import "@/lib/auth-env";
import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

const STATIC_FILE =
  /\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|webmanifest)$/i;

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const loggedIn = Boolean(req.auth);

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isLanding = pathname === "/";
  const isApi = pathname.startsWith("/api/");
  const isLogout = pathname === "/logout";
  const loginHasError = pathname === "/login" && req.nextUrl.searchParams.has("error");
  const isIcon =
    STATIC_FILE.test(pathname) ||
    pathname.startsWith("/apple-icon") ||
    pathname.startsWith("/apple-touch-icon") ||
    pathname === "/icon";

  if (isApi || isLanding || isIcon || isLogout) {
    return NextResponse.next();
  }

  if (!loggedIn && !isAuthPage) {
    const login = new URL("/login", req.url);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  if (loggedIn && isAuthPage && !loginHasError) {
    return NextResponse.redirect(new URL("/chat", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
