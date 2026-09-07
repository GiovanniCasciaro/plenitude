import { createHash, timingSafeEqual } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getSessionSecret } from "@/lib/env";

const COOKIE_NAME = "admin_session";
const SESSION_DURATION = "4h";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 4;

function getSecret() {
  return getSessionSecret();
}

export function getAdminUsername() {
  return (process.env.ADMIN_USERNAME ?? "enova26italia").trim();
}

function getAdminPassword() {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    throw new Error("ADMIN_PASSWORD non configurato.");
  }
  return expected;
}

/** Constant-time string compare to reduce credential timing leaks. */
export function safeEqualString(left: string, right: string) {
  const leftBuf = Buffer.from(left);
  const rightBuf = Buffer.from(right);
  const digestLeft = createHash("sha256").update(leftBuf).digest();
  const digestRight = createHash("sha256").update(rightBuf).digest();
  return timingSafeEqual(digestLeft, digestRight) && leftBuf.length === rightBuf.length;
}

export function verifyAdminCredentials(username: string, password: string) {
  const usernameOk = safeEqualString(username.trim(), getAdminUsername());
  const passwordOk = safeEqualString(password, getAdminPassword());
  return usernameOk && passwordOk;
}

export async function createAdminSession(username: string) {
  const token = await new SignJWT({
    role: "admin",
    username,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return (
      payload.role === "admin" &&
      typeof payload.username === "string" &&
      safeEqualString(payload.username, getAdminUsername())
    );
  } catch {
    return false;
  }
}

export { COOKIE_NAME as ADMIN_SESSION_COOKIE };
