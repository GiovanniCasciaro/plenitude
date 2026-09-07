import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getLegalEntity } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Cookie Policy — Plenitude Dealer",
  description:
    "Informativa sui cookie utilizzati dal sito Plenitude Dealer ai sensi della normativa vigente.",
  robots: { index: true, follow: true },
};

export default function CookiePage() {
  const legal = getLegalEntity();

  return (
    <>
      <SiteHeader />
      <main className="legal-page">
        <article className="legal-card">
          <p className="eyebrow-line">GDPR / ePrivacy</p>
          <h1>Cookie Policy</h1>
          <p className="legal-updated">
            Ultimo aggiornamento: {new Date().toLocaleDateString("it-IT")}
          </p>

          <section>
            <h2>1. Cosa sono i cookie</h2>
            <p>
              I cookie sono piccoli file di testo che i siti web salvano sul
              dispositivo dell&apos;utente. Possono essere tecnici (necessari),
              di preferenza o analitici. Questa informativa descrive i cookie
              usati su <strong>{legal.siteUrl}</strong>.
            </p>
          </section>

          <section>
            <h2>2. Cookie utilizzati</h2>
            <div className="legal-table-wrap">
              <table className="legal-table">
                <thead>
                  <tr>
                    <th>Categoria</th>
                    <th>Esempio</th>
                    <th>Finalità</th>
                    <th>Durata</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Necessari</td>
                    <td>admin_session</td>
                    <td>Autenticazione area admin protetta</td>
                    <td>Sessione / scadenza tecnica</td>
                  </tr>
                  <tr>
                    <td>Necessari</td>
                    <td>plenitude_leader_cookie_consent</td>
                    <td>Memorizzazione delle scelte sul banner cookie</td>
                    <td>Fino a 12 mesi</td>
                  </tr>
                  <tr>
                    <td>Preferenze</td>
                    <td>Solo se accettati</td>
                    <td>Salvataggio opzioni non essenziali</td>
                    <td>Fino a 12 mesi</td>
                  </tr>
                  <tr>
                    <td>Analitici</td>
                    <td>Solo se accettati</td>
                    <td>Statistiche aggregate di utilizzo</td>
                    <td>Fino a 12 mesi</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              I cookie necessari sono installati automaticamente perché
              indispensabili. Preferenze e analitici vengono attivati solo dopo
              consenso tramite il banner.
            </p>
          </section>

          <section>
            <h2>3. Gestione del consenso</h2>
            <p>
              Al primo accesso compare il banner cookie. Puoi accettare tutti i
              cookie, rifiutare quelli non necessari o personalizzare le
              preferenze. Puoi modificare la scelta in qualsiasi momento tramite
              il pulsante <strong>Cookie</strong> in basso a sinistra, oppure
              cancellando i dati del sito dalle impostazioni del browser.
            </p>
          </section>

          <section>
            <h2>4. Come disabilitare i cookie dal browser</h2>
            <p>
              La maggior parte dei browser consente di bloccare o cancellare i
              cookie dalle impostazioni. La disabilitazione dei cookie tecnici
              può compromettere alcune funzioni del sito (es. area admin).
            </p>
          </section>

          <section>
            <h2>5. Titolare e contatti</h2>
            <p>
              Titolare: <strong>{legal.name}</strong>
              <br />
              Email: <a href={`mailto:${legal.email}`}>{legal.email}</a>
              <br />
              Per il trattamento dei dati personali vedi la{" "}
              <Link href="/privacy">Privacy Policy</Link>.
            </p>
          </section>

          <p className="legal-back">
            <Link href="/">← Torna alla home</Link>
          </p>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
