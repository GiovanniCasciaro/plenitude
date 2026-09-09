import { Resend } from "resend";
import { getAdminSubmissionUrl } from "@/lib/app-url";
import { titolareDisplayName } from "@/lib/fields";
import type { Submission } from "@/lib/types";

const DEFAULT_NOTIFIER_EMAIL = "codifiche@gruppoevolvia.it";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("it-IT", {
    timeZone: "Europe/Rome",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function envValue(name: string) {
  const raw = process.env[name]?.trim();
  if (!raw) return undefined;
  return raw.replace(/^['"]|['"]$/g, "").trim() || undefined;
}

export function getNotifierEmail() {
  return envValue("NOTIFIER_EMAIL") ?? DEFAULT_NOTIFIER_EMAIL;
}

export async function notifyNewSubmission(
  submission: Submission,
  request?: Request,
) {
  const apiKey = envValue("RESEND_API_KEY");
  if (!apiKey) {
    console.warn(
      "RESEND_API_KEY assente: notifica email non inviata.",
    );
    return;
  }

  if (!apiKey.startsWith("re_")) {
    throw new Error(
      "RESEND_API_KEY non valida: deve essere la chiave Resend (inizia con re_), non un URL o un altro valore.",
    );
  }

  const resend = new Resend(apiKey);
  const from =
    envValue("RESEND_FROM") ??
    "Plenitude Dealer <noreply@plenitudedealerita.it>";
  const adminUrl = getAdminSubmissionUrl(submission.id, request);
  const createdAt = formatDate(submission.createdAt);

  const text = [
    "È disponibile una nuova codifica su Plenitude Dealer.",
    "",
    `Area Manager: ${submission.areaManagerNome ?? ""} ${submission.areaManagerCognome ?? ""}`.trim(),
    `Ragione sociale: ${submission.ragioneSociale}`,
    `Nome e cognome: ${titolareDisplayName(submission) || "—"}`,
    `Email: ${submission.email ?? "—"}`,
    `Telefono: ${submission.telefono ?? "—"}`,
    `Partita IVA: ${submission.partitaIva}`,
    `Data invio: ${createdAt}`,
    "",
    `Dettaglio candidatura: ${adminUrl}`,
  ].join("\n");

  const html = `
    <p>È disponibile una nuova codifica su <strong>Plenitude Dealer</strong>.</p>
    <ul>
      <li><strong>Area Manager:</strong> ${escapeHtml(submission.areaManagerNome ?? "")} ${escapeHtml(submission.areaManagerCognome ?? "")}</li>
      <li><strong>Ragione sociale:</strong> ${escapeHtml(submission.ragioneSociale)}</li>
      <li><strong>Nome e cognome:</strong> ${escapeHtml(titolareDisplayName(submission) || "—")}</li>
      <li><strong>Email:</strong> ${escapeHtml(submission.email ?? "—")}</li>
      <li><strong>Telefono:</strong> ${escapeHtml(submission.telefono ?? "—")}</li>
      <li><strong>Partita IVA:</strong> ${escapeHtml(submission.partitaIva)}</li>
      <li><strong>Data invio:</strong> ${escapeHtml(createdAt)}</li>
    </ul>
    <p><a href="${adminUrl}">Apri la candidatura in admin</a></p>
  `.trim();

  const { error } = await resend.emails.send({
    from,
    to: getNotifierEmail(),
    subject: `Nuova codifica Plenitude Dealer — ${submission.ragioneSociale}`,
    text,
    html,
  });

  if (error) {
    throw new Error(`Invio email fallito: ${error.message}`);
  }
}
