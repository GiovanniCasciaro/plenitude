import { NextResponse } from "next/server";
import {
  createAdminSession,
  getAdminUsername,
  verifyAdminCredentials,
} from "@/lib/auth";
import {
  checkLoginRateLimit,
  getClientIp,
  isSameOriginRequest,
  registerLoginFailure,
  registerLoginSuccess,
} from "@/lib/admin-security";

const GENERIC_AUTH_ERROR =
  "Credenziali non valide. Controlla username e password.";

export async function POST(request: Request) {
  try {
    if (!isSameOriginRequest(request)) {
      return NextResponse.json(
        { error: "Richiesta non consentita." },
        { status: 403 },
      );
    }

    const ip = getClientIp(request);
    const rate = checkLoginRateLimit(ip);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          error: `Troppi tentativi. Riprova tra ${rate.retryAfterSeconds} secondi.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(rate.retryAfterSeconds) },
        },
      );
    }

    const body = await request.json().catch(() => null);
    const username = String(body?.username ?? "");
    const password = String(body?.password ?? "");

    if (!username || !password) {
      return NextResponse.json({ error: GENERIC_AUTH_ERROR }, { status: 401 });
    }

    if (!verifyAdminCredentials(username, password)) {
      const failure = registerLoginFailure(ip);
      if (failure.locked) {
        return NextResponse.json(
          {
            error: `Troppi tentativi. Riprova tra ${failure.retryAfterSeconds} secondi.`,
          },
          {
            status: 429,
            headers: { "Retry-After": String(failure.retryAfterSeconds) },
          },
        );
      }
      return NextResponse.json({ error: GENERIC_AUTH_ERROR }, { status: 401 });
    }

    registerLoginSuccess(ip);
    await createAdminSession(getAdminUsername());
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Configurazione admin non valida." },
      { status: 500 },
    );
  }
}
