import Image from "next/image";
import {
  PREVIEW_HEADLINE,
  PREVIEW_SITE_URL,
  PREVIEW_SUBLINE,
  PREVIEW_TILES,
} from "@/lib/preview-collage";

export default function AnteprimaPage() {
  const imageUrl = `${PREVIEW_SITE_URL}/anteprima/immagine`;
  const mailUrl = `${PREVIEW_SITE_URL}/anteprima/mail`;

  return (
    <main className="preview-shell">
      <a
        className="preview-collage"
        href={PREVIEW_SITE_URL}
        aria-label="Vai al sito Plenitude Dealer"
      >
        <div className="preview-collage__bar" aria-hidden="true" />
        <div className="preview-collage__body">
          <div className="preview-collage__brand">
            <Image
              src="/assets/logo-plenitude.svg"
              alt=""
              width={180}
              height={176}
              aria-hidden="true"
            />
          </div>

          <p className="preview-collage__eyebrow">Collabora con noi</p>
          <h1 className="preview-collage__title">{PREVIEW_HEADLINE}</h1>
          <p className="preview-collage__subtitle">{PREVIEW_SUBLINE}</p>

          <div className="preview-collage__grid">
            {PREVIEW_TILES.map((tile) => (
              <article
                key={tile.title}
                className="preview-collage__tile"
                style={{ backgroundColor: tile.accent }}
              >
                <p className="preview-collage__tile-label">{tile.label}</p>
                <h2 className="preview-collage__tile-title">{tile.title}</h2>
                <p className="preview-collage__tile-detail">{tile.detail}</p>
              </article>
            ))}
          </div>

          <div className="preview-collage__cta">
            <div>
              <strong>Scopri Plenitude Dealer</strong>
              <br />
              <span>plenitudeleader.it</span>
            </div>
            <span className="preview-collage__cta-mark" aria-hidden="true">
              →
            </span>
          </div>
        </div>
      </a>

      <aside className="preview-help">
        <h2>Usa questa anteprima in email</h2>
        <p>
          Clicca il collage qui sopra per aprire il sito. Per inserirlo in una
          mail HTML, usa l&apos;
          <a href={mailUrl}>anteprima email pronta</a> oppure incorpora
          l&apos;immagine cliccabile da{" "}
          <a href={imageUrl}>/anteprima/immagine</a>.
        </p>
      </aside>
    </main>
  );
}
