import Link from "next/link";
import type { ReactNode } from "react";
import Icon from "./Icon";
import ConsultationTrigger from "@/components/consultation/ConsultationTrigger";

type Props = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost" | "link" | "light" | "accent";
  icon?: string;
  iconPosition?: "left" | "right";
  className?: string;
  size?: "md" | "lg" | "sm";
  ariaLabel?: string;
};

export default function Button({ href, children, variant = "primary", icon, iconPosition, className = "", size = "md", ariaLabel }: Props) {
  const pos = iconPosition ?? (variant === "link" ? "right" : "left");
  const cls = `btn btn--${variant} btn--${size} ${className}`.trim();
  const content = (
    <>
      {icon && pos === "left" ? <Icon name={icon} size={18} /> : null}
      <span>{children}</span>
      {icon && pos === "right" ? <Icon name={icon} size={18} /> : null}
    </>
  );
  if (href === "#consultation") {
    return <ConsultationTrigger className={cls}>{content}</ConsultationTrigger>;
  }
  const external = /^(https?:|tel:|mailto:|sms:)/.test(href);
  if (external) {
    const isWeb = href.startsWith("http");
    return (
      <a href={href} className={cls} aria-label={ariaLabel} {...(isWeb ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} aria-label={ariaLabel}>
      {content}
    </Link>
  );
}
