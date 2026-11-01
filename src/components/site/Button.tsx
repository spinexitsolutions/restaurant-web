"use client";

import Link from "next/link";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import clsx from "clsx";
import type { ReactNode } from "react";

type Variant = "primary" | "dark" | "light" | "glass" | "outline";
type Size = "sm" | "md" | "lg";

interface Props {
  children: ReactNode;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  type?: "button" | "submit";
  variant?: Variant;
  size?: Size;
  icon?: ReactNode | false;
  block?: boolean;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

/**
 * Noor's signature button: the label rolls up on hover and the icon's
 * circle swells to repaint the whole pill. Works as a link or a button.
 */
export default function Btn({ children, href, onClick, type = "button", variant = "primary", size = "md", icon, block, disabled, className, ...rest }: Props) {
  const text = typeof children === "string" ? children : undefined;
  const cls = clsx(
    "btn",
    variant !== "primary" && `btn-${variant}`,
    size !== "md" && `btn-${size}`,
    block && "btn-block",
    icon === false && "btn-noicon",
    className
  );
  const inner = (
    <>
      {text ? (
        <span className="btn-label">
          <span data-text={text}>{text}</span>
        </span>
      ) : (
        <span className="flex items-center gap-2">{children}</span>
      )}
      {icon !== false && <span className="btn-ico">{icon ?? <ArrowUpRight size={size === "sm" ? 15 : 18} />}</span>}
    </>
  );
  if (href)
    return (
      <Link href={href} className={cls} onClick={onClick} aria-label={rest["aria-label"]}>
        {inner}
      </Link>
    );
  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled} aria-label={rest["aria-label"]}>
      {inner}
    </button>
  );
}

export function TextLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={clsx("link-u text-[17px]", className)}>
      {children}
      <ChevronRight size={18} />
    </Link>
  );
}
