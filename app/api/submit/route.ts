import { NextResponse } from "next/server";
import { notifyNewSubmission } from "@/lib/notify";
import { createSubmission } from "@/lib/store";
import {
  isBrowserFormSubmit,
  SUBMIT_SUCCESS_MESSAGE,
  submitRedirectUrl,
} from "@/lib/submit-messages";
import { submissionSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const maxDuration = 60;

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 30;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function respondError(request: Request, message: string, status: number) {
  if (isBrowserFormSubmit(request)) {
    return NextResponse.redirect(
      submitRedirectUrl(request, { error: message }),
      303,
    );
  }
  return NextResponse.json({ error: message }, { status });
}

function respondSuccess(request: Request) {
  if (isBrowserFormSubmit(request)) {
    return NextResponse.redirect(
      submitRedirectUrl(request, { submitted: "1" }),
      303,
    );
  }
  return NextResponse.json({
    success: true,
    message: SUBMIT_SUCCESS_MESSAGE,
  });
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }

  entry.count += 1;
  return false;
}

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

    if (isRateLimited(ip)) {
      return respondError(
        request,
        "Troppe richieste. Riprova tra qualche minuto.",
        429,
      );
    }

    const formData = await request.formData();
    const payload = {
      areaManagerNome: String(formData.get("areaManagerNome") ?? ""),
      areaManagerCognome: String(formData.get("areaManagerCognome") ?? ""),
      email: String(formData.get("email") ?? ""),
      telefono: String(formData.get("telefono") ?? "").trim(),
      nomeCognome: String(formData.get("nomeCognome") ?? ""),
      ragioneSociale: String(formData.get("ragioneSociale") ?? ""),
      partitaIva: String(formData.get("partitaIva") ?? "").replace(/\s/g, ""),
      sedeLegale: String(formData.get("sedeLegale") ?? ""),
      indirizzoOperativo: String(formData.get("indirizzoOperativo") ?? ""),
      comune: String(formData.get("comune") ?? ""),
      cap: String(formData.get("cap") ?? ""),
      provincia: String(formData.get("provincia") ?? ""),
      regione: String(formData.get("regione") ?? ""),
      tipologiaAttivita: String(formData.get("tipologiaAttivita") ?? ""),
      esperienzaEnergetico: String(formData.get("esperienzaEnergetico") ?? ""),
      altriCompetitor: String(formData.get("altriCompetitor") ?? ""),
      website: String(formData.get("website") ?? ""),
      privacyConsent: formData.get("privacyConsent") === "on",
      marketingConsent: formData.get("marketingConsent") === "on",
    };

    const parsed = submissionSchema.safeParse(payload);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Dati non validi.";
      return respondError(request, firstError, 400);
    }

    const {
      website: _website,
      privacyConsent,
      marketingConsent,
      ...data
    } = parsed.data;

    if (!privacyConsent) {
      return respondError(
        request,
        "Per inviare la candidatura devi accettare la Privacy Policy.",
        400,
      );
    }

    const submission = await createSubmission(data, {
      privacyConsentAt: new Date().toISOString(),
      marketingConsent,
    });

    try {
      await notifyNewSubmission(submission, request);
    } catch (emailError) {
      console.error("Notification email error:", emailError);
    }

    return respondSuccess(request);
  } catch (error) {
    console.error("Submit error:", error);

    if (error instanceof Error) {
      if (
        error.message.includes("BLOB_READ_WRITE_TOKEN") ||
        error.message.includes("Storage non configurato")
      ) {
        return respondError(
          request,
          "Servizio temporaneamente non disponibile. Contatta l'amministratore del sito.",
          503,
        );
      }

      if (
        error.message.includes("Vercel Blob") ||
        error.message.includes("Impossibile salvare la candidatura su Vercel Blob")
      ) {
        return respondError(
          request,
          "Impossibile salvare la candidatura. Riprova tra qualche minuto.",
          503,
        );
      }
    }

    return respondError(
      request,
      "Errore durante l'invio. Riprova più tardi.",
      500,
    );
  }
}
