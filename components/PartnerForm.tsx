"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { LocationFields } from "@/components/LocationFields";
import { FORM_FIELDS } from "@/lib/fields";
import { SUBMIT_SUCCESS_MESSAGE } from "@/lib/submit-messages";

export function PartnerForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [locationResetKey, setLocationResetKey] = useState(0);
  const [status, setStatus] = useState<{
    type: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });

  useEffect(() => {
    if (searchParams.get("submitted") === "1") {
      setStatus({
        type: "success",
        message: SUBMIT_SUCCESS_MESSAGE,
      });
      router.replace("/#candidatura", { scroll: false });
      return;
    }

    const error = searchParams.get("error");
    if (error) {
      setStatus({
        type: "error",
        message: error,
      });
      router.replace("/#candidatura", { scroll: false });
    }
  }, [router, searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ type: "loading", message: "Invio in corso..." });

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus({
          type: "error",
          message: data.error ?? "Errore durante l'invio.",
        });
        return;
      }

      setStatus({
        type: "success",
        message: data.message,
      });
      form.reset();
      setLocationResetKey((value) => value + 1);
    } catch {
      setStatus({
        type: "error",
        message: "Errore di rete. Controlla la connessione e riprova.",
      });
    }
  }

  const areaManagerFields = FORM_FIELDS.filter(
    (field) => field.section === "areaManager",
  );
  const legalFields = FORM_FIELDS.filter((field) => field.section === "legal");
  const profileFields = FORM_FIELDS.filter(
    (field) =>
      field.section === "operativo" &&
      !["regione", "provincia", "comune", "cap"].includes(field.key),
  );
  const indirizzoField = profileFields.find(
    (field) => field.key === "indirizzoOperativo",
  );
  const remainingProfileFields = profileFields.filter(
    (field) => field.key !== "indirizzoOperativo",
  );

  return (
    <form
      className="contact-form"
      action="/api/submit"
      method="post"
      onSubmit={handleSubmit}
    >
      <div className="form-section form-section--area-manager">
        <h3>Area Manager</h3>
        <p className="form-section-intro">
          Inserisci i dati anagrafici di chi compila il form.
        </p>
        <div className="input-row">
          {areaManagerFields.map((field) => (
            <div className="input-group" key={field.key}>
              <label htmlFor={field.key}>{field.label}</label>
              <input
                id={field.key}
                name={field.key}
                type="text"
                placeholder={field.placeholder}
                required
                autoComplete={
                  field.key === "areaManagerNome" ? "given-name" : "family-name"
                }
              />
            </div>
          ))}
        </div>
      </div>

      <div className="form-section form-section--legal">
        <h3>Dati legali e contatto</h3>
        <div className="input-row">
          {legalFields.slice(0, 2).map((field) => (
            <div className="input-group" key={field.key}>
              <label htmlFor={field.key}>{field.label}</label>
              <input
                id={field.key}
                name={field.key}
                type={field.type ?? "text"}
                placeholder={field.placeholder}
                required
                autoComplete={
                  field.type === "tel"
                    ? "tel"
                    : field.type === "email"
                      ? "email"
                      : undefined
                }
              />
            </div>
          ))}
        </div>
        {legalFields.slice(2).map((field) => (
          <div className="input-group" key={field.key}>
            <label htmlFor={field.key}>{field.label}</label>
            <input
              id={field.key}
              name={field.key}
              type={field.type ?? "text"}
              placeholder={field.placeholder}
              required
            />
          </div>
        ))}
      </div>

      <div className="form-section form-section--operativo">
        <h3>Sede operativa e profilo commerciale</h3>
        {indirizzoField ? (
          <div className="input-group">
            <label htmlFor={indirizzoField.key}>{indirizzoField.label}</label>
            <input
              id={indirizzoField.key}
              name={indirizzoField.key}
              type="text"
              placeholder={indirizzoField.placeholder}
              required
              autoComplete="street-address"
            />
          </div>
        ) : null}

        <LocationFields resetKey={locationResetKey} />

        {remainingProfileFields.map((field) => (
          <div className="input-group" key={field.key}>
            {field.type === "yesno" ? (
              <>
                <span className="field-legend" id={`${field.key}-label`}>
                  {field.label}
                </span>
                <div
                  className="choice-row"
                  role="radiogroup"
                  aria-labelledby={`${field.key}-label`}
                >
                  {(["Sì", "No"] as const).map((option) => (
                    <label className="choice-option" key={option}>
                      <input
                        type="radio"
                        name={field.key}
                        value={option}
                        required
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </>
            ) : (
              <>
                <label htmlFor={field.key}>{field.label}</label>
                {field.type === "textarea" ? (
                  <textarea
                    id={field.key}
                    name={field.key}
                    placeholder={field.placeholder}
                    rows={4}
                    required
                  />
                ) : (
                  <input
                    id={field.key}
                    name={field.key}
                    type={field.type ?? "text"}
                    placeholder={field.placeholder}
                    required
                  />
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <div className="hp-field" aria-hidden="true">
        <label htmlFor="website">Sito web</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="form-section form-section--consents">
        <h3>Consensi privacy</h3>
        <label className="consent-item">
          <input type="checkbox" name="privacyConsent" value="on" required />
          <span>
            Dichiaro di aver letto l&apos;
            <a href="/privacy" target="_blank" rel="noreferrer">
              Privacy Policy
            </a>{" "}
            e acconsento al trattamento dei dati personali per la gestione della
            candidatura partner. <em>(obbligatorio)</em>
          </span>
        </label>
        <label className="consent-item">
          <input type="checkbox" name="marketingConsent" value="on" />
          <span>
            Acconsento a ricevere comunicazioni informative e commerciali
            relative a offerte e opportunità del programma Plenitude Leader.{" "}
            <em>(facoltativo)</em>
          </span>
        </label>
        <p className="consent-note">
          Puoi revocare i consensi in qualsiasi momento scrivendo all&apos;indirizzo
          privacy indicato nella Privacy Policy. Maggiori dettagli anche nella{" "}
          <a href="/cookie" target="_blank" rel="noreferrer">
            Cookie Policy
          </a>
          .
        </p>
      </div>

      <button
        className="btn btn-primary"
        type="submit"
        disabled={status.type === "loading"}
      >
        {status.type === "loading" ? "Invio in corso..." : "Invia candidatura"}
      </button>

      {status.message ? (
        <p
          className={`form-status ${status.type === "error" ? "error" : "success"}`}
          aria-live="polite"
        >
          {status.message}
        </p>
      ) : null}
    </form>
  );
}
