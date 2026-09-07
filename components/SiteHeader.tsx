import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header" id="top">
      <nav className="nav" aria-label="Navigazione principale">
        <Link className="logo" href="/" aria-label="Plenitude Leader - Home">
          <Image
            src="/assets/logo-plenitude.svg"
            alt="Plenitude Leader"
            width={180}
            height={176}
            className="logo-image"
            priority
          />
        </Link>
        <div className="nav-actions">
          <a className="btn btn-primary btn-small" href="#candidatura">
            Compila il form
          </a>
        </div>
      </nav>
    </header>
  );
}
