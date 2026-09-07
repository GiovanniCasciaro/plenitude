import Link from "next/link";
import { getLegalEntity } from "@/lib/legal";

export function SiteFooter() {
  const legal = getLegalEntity();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <strong>{legal.brand}</strong>
          <p>
            Programma commerciale partner. Titolare del trattamento:{" "}
            {legal.name}.
          </p>
        </div>
        <nav className="site-footer__nav" aria-label="Informazioni legali">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/cookie">Cookie Policy</Link>
          <a href={`mailto:${legal.email}`}>Contatti privacy</a>
        </nav>
      </div>
      <p className="site-footer__copy">
        © {year} {legal.name}. Tutti i diritti riservati.
      </p>
    </footer>
  );
}
