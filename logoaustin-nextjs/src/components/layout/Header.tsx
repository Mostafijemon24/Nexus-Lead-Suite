import Link from "next/link";
import Image from "next/image";
import { site } from "@/data/site";
import { mainNav, mobileNav } from "@/data/navigation";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import LanguageSwitcher from "@/components/navigation/LanguageSwitcher";
import MobileMenu from "@/components/navigation/MobileMenu";
import DesktopNav from "@/components/navigation/DesktopNav";

export default function Header() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="topbar" role="region" aria-label="Free consultation offer">
        <div className="container topbar__inner">
          <p>Do you want a logo that gets your business noticed?</p>
          <Button href="#consultation" variant="accent" size="sm">
            Free Consultation
          </Button>
        </div>
      </div>
      <header className="header" id="top">
        <div className="container header__inner">
          <Link href="/" className="header__logo" aria-label={`${site.brandName} home`}>
            <Image src={site.logo.light.src} alt={site.logo.light.alt} width={site.logo.light.width} height={site.logo.light.height} priority sizes="190px" />
          </Link>
          <DesktopNav items={mainNav} />
          <div className="header__actions">
            <LanguageSwitcher />
            <a href={`tel:${site.phone.e164}`} className="header__phone" aria-label={`Call ${site.phone.display}`}>
              <Icon name="phone" size={18} />
              <span>{site.phone.display}</span>
            </a>
            <Button href="#consultation" variant="primary" size="sm" className="header__cta">
              Free Consultation
            </Button>
            <MobileMenu items={mobileNav} />
          </div>
        </div>
      </header>
    </>
  );
}
