import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["az", "en", "ru"];
const defaultLocale = "az";

function preferredLocale(request: NextRequest): string {
  const header = request.headers.get("accept-language") ?? "";
  for (const part of header.split(",")) {
    const code = part.trim().slice(0, 2).toLowerCase();
    if (locales.includes(code)) return code;
  }
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Optimistic admin gate: only checks that a session cookie exists. The signature is verified
  // in the admin layout and in every Server Action, which is where access is actually enforced.
  if (pathname.startsWith("/admin")) {
    if (pathname !== "/admin/login" && !request.cookies.has("cgg_admin")) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return;
  }

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return;

  const url = request.nextUrl.clone();
  url.pathname = `/${preferredLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip internal paths, API and anything that looks like a file. Admin is handled above.
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
