export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminSubmissionActions } from "@/components/admin/AdminSubmissionActions";
import { FORM_FIELDS } from "@/lib/fields";
import { getSubmissionExcelDownloadUrl } from "@/lib/submission";
import { getSubmission, markSubmissionRead } from "@/lib/store";

export default async function AdminDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let submission = await getSubmission(id);

  if (!submission) {
    notFound();
  }

  if (!submission.deletedAt && !submission.readAt) {
    submission = (await markSubmissionRead(id)) ?? submission;
  }

  const areaManagerFields = FORM_FIELDS.filter(
    (field) => field.section === "areaManager",
  );
  const legalFields = FORM_FIELDS.filter((field) => field.section === "legal");
  const operativoFields = FORM_FIELDS.filter(
    (field) => field.section === "operativo",
  );

  return (
    <main className="admin-shell">
      <div className="admin-card">
        <div className="admin-header">
          <div>
            <Link
              href={
                submission.deletedAt
                  ? "/admin?tab=trash"
                  : submission.readAt
                    ? "/admin?tab=read"
                    : "/admin?tab=unread"
              }
              className="btn btn-ghost btn-small"
              prefetch={false}
            >
              ← Torna alla lista
            </Link>
            <h1 style={{ marginTop: "1rem" }}>{submission.ragioneSociale}</h1>
            <p className="hero-subtitle">
              Ricevuta il{" "}
              {new Date(submission.createdAt).toLocaleString("it-IT", {
                dateStyle: "full",
                timeStyle: "short",
              })}
              {submission.deletedAt
                ? " · Nel cestino"
                : submission.readAt
                  ? " · Letta"
                  : " · Da leggere"}
            </p>
            <div className="admin-detail-toolbar">
              <a
                className="btn btn-primary btn-small"
                href={getSubmissionExcelDownloadUrl(submission)}
              >
                Scarica Excel cliente
              </a>
              <AdminSubmissionActions
                id={submission.id}
                inTrash={Boolean(submission.deletedAt)}
                readAt={submission.readAt ?? null}
              />
            </div>
          </div>
        </div>

        <div
          className="form-section form-section--area-manager"
          style={{ marginTop: "1.5rem" }}
        >
          <h3>Area Manager</h3>
          <div className="detail-grid">
            {areaManagerFields.map((field) => (
              <div className="detail-item" key={field.key}>
                <span>{field.label}</span>
                <strong>{submission[field.key] || "—"}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="form-section form-section--legal">
          <h3>Dati legali e contatto</h3>
          <div className="detail-grid">
            {legalFields.map((field) => (
              <div className="detail-item" key={field.key}>
                <span>{field.label}</span>
                <strong>{submission[field.key] || "—"}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="form-section form-section--operativo">
          <h3>Sede operativa e profilo commerciale</h3>
          <div className="detail-grid">
            {operativoFields.map((field) => (
              <div className="detail-item" key={field.key}>
                <span>{field.label}</span>
                <strong>{submission[field.key] || "—"}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="form-section form-section--notes">
          <h3>Note aggiuntive</h3>
          <div className="detail-grid">
            <div className="detail-item detail-item--full">
              <span>Note aggiuntive</span>
              <strong style={{ whiteSpace: "pre-wrap" }}>
                {submission.noteAggiuntive?.trim()
                  ? submission.noteAggiuntive
                  : "—"}
              </strong>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Consensi GDPR</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span>Privacy Policy accettata</span>
              <strong>
                {submission.privacyConsentAt
                  ? new Date(submission.privacyConsentAt).toLocaleString(
                      "it-IT",
                    )
                  : "Non registrato (candidatura precedente)"}
              </strong>
            </div>
            <div className="detail-item">
              <span>Consenso comunicazioni commerciali</span>
              <strong>
                {submission.marketingConsent === true
                  ? "Sì"
                  : submission.marketingConsent === false
                    ? "No"
                    : "Non registrato"}
              </strong>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>File Excel</h3>
          <p className="hero-subtitle" style={{ marginBottom: "1rem" }}>
            Excel personalizzato con i dati di questa candidatura.
          </p>
          <a
            className="btn btn-primary btn-small"
            href={getSubmissionExcelDownloadUrl(submission)}
          >
            Scarica Excel cliente
          </a>
        </div>
      </div>
    </main>
  );
}
