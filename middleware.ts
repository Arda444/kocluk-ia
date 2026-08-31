import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const loggedIn = Boolean(req.auth);

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isLanding = pathname === "/";
  const isApi = pathname.startsWith("/api/");

  if (isApi || isLanding) {
    return NextResponse.next();
  }

  if (!loggedIn && !isAuthPage) {
    const login = new URL("/login", req.url);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  if (loggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/chat", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
