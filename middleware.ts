import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getSessionSecret } from "@/lib/env";

const COOKIE_NAME = "admin_session";
const DEFAULT_USERNAME = "enova26italia";

function getSecret() {
  try {
    return getSessionSecret();
  } catch {
    return null;
  }
}

function getExpectedUsername() {
  return (process.env.ADMIN_USERNAME ?? DEFAULT_USERNAME).trim();
}

function securityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  response.headers.set("Cache-Control", "no-store");
  return response;
}

async function hasValidSession(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const secret = getSecret();
  if (!token || !secret) return false;

  try {
    const { payload } = await jwtVerify(token, secret);
    return (
      payload.role === "admin" &&
      payload.username === getExpectedUsername()
    );
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");
  const isLoginPage = pathname.startsWith("/admin/login");
  const isLoginApi = pathname === "/api/admin/login";
  const isLogoutApi = pathname === "/api/admin/logout";

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  if (isLoginApi) {
    return securityHeaders(NextResponse.next());
  }

  if (isLoginPage) {
    if (await hasValidSession(request)) {
      return securityHeaders(
        NextResponse.redirect(new URL("/admin", request.url)),
      );
    }
    return securityHeaders(NextResponse.next());
  }

  if (!(await hasValidSession(request))) {
    if (isAdminApi) {
      if (isLogoutApi) {
        return securityHeaders(NextResponse.next());
      }
      return securityHeaders(
        NextResponse.json({ error: "Non autorizzato." }, { status: 401 }),
      );
    }

    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return securityHeaders(NextResponse.redirect(loginUrl));
  }

  return securityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
