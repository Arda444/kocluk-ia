import { NextResponse } from "next/server";

const STATIC_FILE = /\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|webmanifest)$/i;

export function middleware(req: Request) {
  const url = new URL(req.url);
  const pathname = url.pathname;
  const isIcon =
    STATIC_FILE.test(pathname) ||
    pathname.startsWith("/apple-icon") ||
    pathname.startsWith("/apple-touch-icon") ||
    pathname === "/icon";

  if (isIcon || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (pathname === "/" || pathname === "/login" || pathname === "/register" || pathname === "/logout") {
    return NextResponse.redirect(new URL("/program", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
