import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header" id="top">
      <nav className="nav" aria-label="Navigazione principale">
        <Link className="logo" href="/" aria-label="Plenitude Dealer - Home">
          <Image
            src="/assets/logo-plenitude.png"
            alt="Plenitude"
            width={262}
            height={256}
            className="logo-image"
            priority
          />
          <Image
            src="/assets/logo-futuro-green.png"
            alt="Futuro Green"
            width={249}
            height={256}
            className="logo-image logo-image--partner"
            priority
          />
        </Link>
        <div className="nav-actions">
          <a className="btn btn-primary btn-small nav-cta" href="#candidatura">
            <span className="nav-cta__full">Compila il form</span>
            <span className="nav-cta__short">Candidati</span>
          </a>
        </div>
      </nav>
    </header>
  );
}
