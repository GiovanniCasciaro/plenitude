import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getLegalEntity } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy — Plenitude Leader",
  description:
    "Informativa sul trattamento dei dati personali ai sensi del Regolamento (UE) 2016/679 (GDPR).",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  const legal = getLegalEntity();

  return (
    <>
      <SiteHeader />
      <main className="legal-page">
        <article className="legal-card">
          <p className="eyebrow-line">GDPR</p>
          <h1>Privacy Policy</h1>
          <p className="legal-updated">
            Ultimo aggiornamento: {new Date().toLocaleDateString("it-IT")}
          </p>

          <section>
            <h2>1. Titolare del trattamento</h2>
            <p>
              Il Titolare del trattamento dei dati personali raccolti tramite il
              sito <strong>{legal.siteUrl}</strong> ({legal.brand}) è:
            </p>
            <ul>
              <li>
                <strong>{legal.name}</strong>
              </li>
              <li>Indirizzo: {legal.address}</li>
              {legal.vat ? <li>P. IVA / CF: {legal.vat}</li> : null}
              <li>
                Email privacy:{" "}
                <a href={`mailto:${legal.email}`}>{legal.email}</a>
              </li>
            </ul>
          </section>

          <section>
            <h2>2. Tipologie di dati trattati</h2>
            <p>Possiamo trattare:</p>
            <ul>
              <li>
                dati anagrafici e di contatto (nome, cognome, email, indirizzo);
              </li>
              <li>
                dati aziendali (ragione sociale, Partita IVA, sede legale e
                operativa, tipologia di attività);
              </li>
              <li>
                informazioni commerciali fornite volontariamente nel form di
                candidatura partner;
              </li>
              <li>
                dati tecnici di navigazione (indirizzo IP, log, cookie tecnici)
                necessari alla sicurezza e al funzionamento del sito.
              </li>
            </ul>
          </section>

          <section>
            <h2>3. Finalità e basi giuridiche</h2>
            <ul>
              <li>
                <strong>Gestione candidature partner</strong> — trattiamo i dati
                per valutare e gestire la richiesta di collaborazione (art. 6.1.b
                GDPR, misure precontrattuali).
              </li>
              <li>
                <strong>Adempimenti legali</strong> — ove richiesto dalla legge
                (art. 6.1.c GDPR).
              </li>
              <li>
                <strong>Sicurezza e funzionamento del sito</strong> — interesse
                legittimo (art. 6.1.f GDPR).
              </li>
              <li>
                <strong>Comunicazioni informative/commerciali</strong> — solo
                con consenso espresso, se fornito (art. 6.1.a GDPR).
              </li>
            </ul>
          </section>

          <section>
            <h2>4. Modalità del trattamento e conservazione</h2>
            <p>
              I dati sono trattati con strumenti elettronici e misure tecniche
              organizzative adeguate. Le candidature sono conservate per il tempo
              necessario alla valutazione del mandato e, in caso di
              instaurazione del rapporto, per la durata dello stesso e dei
              relativi obblighi di legge. In assenza di esito positivo, i dati
              sono di norma cancellati o anonimizzati entro 24 mesi
              dall&apos;invio, salvo diversa necessità legale.
            </p>
          </section>

          <section>
            <h2>5. Destinatari e trasferimenti</h2>
            <p>
              I dati possono essere comunicati a soggetti autorizzati dal
              Titolare, a fornitori di servizi tecnici (hosting, storage, email)
              nominati responsabili del trattamento, e — ove necessario — a
              Plenitude Leader
              o società del gruppo per la valutazione del mandato commerciale.
              Eventuali trasferimenti extra-UE avvengono solo con garanzie
              adeguate previste dal GDPR.
            </p>
          </section>

          <section>
            <h2>6. Natura del conferimento</h2>
            <p>
              Il conferimento dei dati richiesti nel form di candidatura è
              necessario per gestire la richiesta. Il mancato conferimento
              impedisce l&apos;invio della candidatura. Il consenso alle
              comunicazioni commerciali è facoltativo.
            </p>
          </section>

          <section>
            <h2>7. Diritti dell&apos;interessato</h2>
            <p>
              Ai sensi degli artt. 15–22 GDPR puoi esercitare i diritti di
              accesso, rettifica, cancellazione, limitazione, portabilità,
              opposizione e revoca del consenso. Le richieste vanno inviate a{" "}
              <a href={`mailto:${legal.email}`}>{legal.email}</a>. Hai inoltre
              diritto di proporre reclamo al Garante per la protezione dei dati
              personali (
              <a
                href="https://www.garanteprivacy.it"
                target="_blank"
                rel="noreferrer"
              >
                www.garanteprivacy.it
              </a>
              ).
            </p>
          </section>

          <section>
            <h2>8. Cookie</h2>
            <p>
              Per informazioni sui cookie utilizzati dal sito consulta la{" "}
              <Link href="/cookie">Cookie Policy</Link>.
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
