import Link from "next/link";
import Image from "next/image";
import { site } from "@/data/site";
import { footerLinks } from "@/data/navigation";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer" id="footer">
      <section className="footer__cta" aria-labelledby="footer-cta-title">
        <div className="container footer__cta-inner">
          <div>
            <p className="eyebrow eyebrow--light">Free consultation</p>
            <h2 id="footer-cta-title">Need Expert Help? Get a Free Consultation.</h2>
            <p>Tell us about your project and discover how our team can help bring your ideas to life. No upfront payment, multiple concepts and revisions included.</p>
          </div>
          <div className="btn-group">
            <Button href="#consultation" variant="primary" size="lg">
              Get a Free Consultation
            </Button>
            <Button href={`tel:${site.phone.e164}`} variant="light" size="lg" icon="phone">
              Call {site.phone.display}
            </Button>
          </div>
        </div>
      </section>

      <div className="container footer__grid">
        <div className="footer__col footer__about">
          <Link href="/" aria-label={`${site.brandName} home`}>
            <Image src={site.logo.light.src} alt={site.logo.light.alt} width={site.logo.light.width} height={site.logo.light.height} sizes="170px" />
          </Link>
          <p>
            {site.legalName} serves small business owners with brand and identity research, design and development: custom logos, AI logo cleanup, branding, graphic design and websites, delivered remotely across Austin and Central Texas.
          </p>
          <ul className="footer__contact">
            <li>
              <Icon name="phone" size={16} />
              <a href={`tel:${site.phone.e164}`}>{site.phone.display}</a>
            </li>
            <li>
              <Icon name="clock" size={16} />
              <span>
                Same-day appointments: <a href={`tel:${site.phoneAlt.e164}`}>{site.phoneAlt.display}</a>
              </span>
            </li>
            <li>
              <Icon name="whatsapp" size={16} />
              <a href={site.whatsapp.url} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </li>
            <li>
              <Icon name="map-pin" size={16} />
              <a href={site.google.mapsUrl} target="_blank" rel="noopener noreferrer">
                {site.address.display}
              </a>
            </li>
          </ul>
          <p className="footer__pay">We accept payment by {site.payments.join(" · ")}.</p>
          <ul className="footer__social" aria-label="Social profiles">
            <li>
              <a href={site.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Logo Design Austin on Facebook">
                <Icon name="facebook" size={18} />
              </a>
            </li>
            <li>
              <a href={site.google.mapsUrl} target="_blank" rel="noopener noreferrer" aria-label="Logo Design Austin on Google Maps">
                <Icon name="map-pin" size={18} />
              </a>
            </li>
          </ul>
        </div>
        <nav className="footer__col" aria-labelledby="f-services">
          <h3 id="f-services">Services</h3>
          <ul>
            {footerLinks.services.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav className="footer__col" aria-labelledby="f-industries">
          <h3 id="f-industries">Industry Logos</h3>
          <ul>
            {footerLinks.industries.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav className="footer__col" aria-labelledby="f-company">
          <h3 id="f-company">Important Links</h3>
          <ul>
            {footerLinks.company.map((l) => (
              <li key={l.href + l.label}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p>
            © {year} {site.brandName} · {site.legalName}. All rights reserved.
          </p>
          <ul>
            {footerLinks.legal.map((l) => (
              <li key={l.href}>
                {l.href.endsWith(".xml") ? <a href={l.href}>{l.label}</a> : <Link href={l.href}>{l.label}</Link>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
