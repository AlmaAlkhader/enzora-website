import { Instagram, Facebook, Linkedin } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

const TikTokIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.92a8.16 8.16 0 0 0 4.77 1.52V7a4.85 4.85 0 0 1-1.84-.31z" />
  </svg>
);

export type SocialLink = {
  name: string;
  url: string | null;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export const socialLinks: SocialLink[] = [
  {
    name: "Instagram",
    url: "https://www.instagram.com/enzora.bzu/",
    label: "Enzora Instagram",
    Icon: Instagram,
  },
  {
    name: "Facebook",
    url: "https://www.facebook.com/profile.php?id=61574411847833",
    label: "Enzora Facebook",
    Icon: Facebook,
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/company/enzorabzu26",
    label: "Enzora LinkedIn",
    Icon: Linkedin,
  },
  {
    name: "TikTok",
    url: null,
    label: "Enzora TikTok",
    Icon: TikTokIcon,
  },
];

type Variant = "onDark" | "onLight";
type Size = "sm" | "md";

type SocialIconsProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
};

const sizeStyles: Record<Size, { box: string; icon: string }> = {
  sm: { box: "h-9 w-9", icon: "h-4 w-4" },
  md: { box: "h-11 w-11", icon: "h-5 w-5" },
};

const variantStyles: Record<Variant, { active: string; disabled: string }> = {
  onDark: {
    active:
      "border-white/15 bg-white/5 text-white hover:text-accent hover:border-accent/50 hover:bg-accent/10 focus-visible:ring-accent/60",
    disabled: "border-white/10 bg-white/5 text-white/30",
  },
  onLight: {
    active:
      "border-primary/15 bg-primary/5 text-primary hover:text-accent-foreground hover:bg-accent/15 hover:border-accent/40 focus-visible:ring-primary/40",
    disabled: "border-primary/10 bg-primary/5 text-primary/30",
  },
};

export function SocialIcons({
  variant = "onDark",
  size = "md",
  className = "",
}: SocialIconsProps) {
  const sz = sizeStyles[size];
  const styles = variantStyles[variant];
  const baseBtn = `inline-flex items-center justify-center rounded-full border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${sz.box}`;

  return (
    <ul className={`flex flex-wrap items-center gap-3 ${className}`}>
      {socialLinks.map(({ name, url, label, Icon }) => {
        if (!url) {
          return (
            <li key={name}>
              <span
                role="img"
                aria-label={`${label} (coming soon)`}
                aria-disabled="true"
                title={`${name} (coming soon)`}
                className={`${baseBtn} ${styles.disabled} cursor-not-allowed opacity-60`}
              >
                <Icon className={sz.icon} />
              </span>
            </li>
          );
        }
        return (
          <li key={name}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className={`${baseBtn} ${styles.active} hover:-translate-y-0.5`}
            >
              <Icon className={sz.icon} />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
