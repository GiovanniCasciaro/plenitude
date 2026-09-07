"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  COOKIE_CONSENT_KEY,
  COOKIE_CONSENT_VERSION,
  type CookiePreferences,
} from "@/lib/legal";

function readConsent(): CookiePreferences | null {
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookiePreferences;
    if (parsed.version !== COOKIE_CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveConsent(prefs: Omit<CookiePreferences, "necessary" | "version" | "updatedAt">) {
  const value: CookiePreferences = {
    necessary: true,
    preferences: prefs.preferences,
    analytics: prefs.analytics,
    version: COOKIE_CONSENT_VERSION,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("cookie-consent-updated", { detail: value }));
  return value;
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [preferences, setPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const existing = readConsent();
    if (!existing) {
      setVisible(true);
      return;
    }
    setPreferences(existing.preferences);
    setAnalytics(existing.analytics);
  }, []);

  function acceptAll() {
    saveConsent({ preferences: true, analytics: true });
    setVisible(false);
  }

  function rejectOptional() {
    saveConsent({ preferences: false, analytics: false });
    setVisible(false);
  }

  function saveCustom() {
    saveConsent({ preferences, analytics });
    setVisible(false);
  }

  if (!visible) {
    return (
      <button
        type="button"
        className="cookie-reopen"
        onClick={() => {
          setShowPrefs(true);
          setVisible(true);
        }}
      >
        Cookie
      </button>
    );
  }

  return (
    <div className="cookie-banner" role="dialog" aria-labelledby="cookie-title" aria-live="polite">
      <div className="cookie-banner__panel">
        <h2 id="cookie-title">Informativa cookie</h2>
        <p>
          Utilizziamo cookie tecnici necessari al funzionamento del sito. Con il
          tuo consenso possiamo attivare anche cookie di preferenza e di
          misurazione. Maggiori dettagli nella{" "}
          <Link href="/cookie">Cookie Policy</Link> e nella{" "}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>

        {showPrefs ? (
          <div className="cookie-prefs">
            <label className="cookie-pref">
              <input type="checkbox" checked disabled readOnly />
              <span>
                <strong>Necessari</strong> — sessioni, sicurezza e funzionalità
                essenziali (sempre attivi).
              </span>
            </label>
            <label className="cookie-pref">
              <input
                type="checkbox"
                checked={preferences}
                onChange={(event) => setPreferences(event.target.checked)}
              />
              <span>
                <strong>Preferenze</strong> — memorizzano scelte come lingua o
                impostazioni di visualizzazione.
              </span>
            </label>
            <label className="cookie-pref">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(event) => setAnalytics(event.target.checked)}
              />
              <span>
                <strong>Analitici</strong> — ci aiutano a capire come viene usato
                il sito in forma aggregata.
              </span>
            </label>
          </div>
        ) : null}

        <div className="cookie-banner__actions">
          <button type="button" className="btn btn-primary btn-small" onClick={acceptAll}>
            Accetta tutti
          </button>
          <button type="button" className="btn btn-ghost btn-small" onClick={rejectOptional}>
            Solo necessari
          </button>
          {showPrefs ? (
            <button type="button" className="btn btn-ghost btn-small" onClick={saveCustom}>
              Salva preferenze
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-ghost btn-small"
              onClick={() => setShowPrefs(true)}
            >
              Personalizza
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
