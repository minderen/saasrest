import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
  action,
}: {
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  align?: "center" | "left";
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      {title ? (
        <h2 className="max-w-3xl text-3xl font-semibold leading-tight text-foreground sm:text-4xl">{title}</h2>
      ) : null}
      {subtitle ? <p className="max-w-2xl text-base text-muted-foreground">{subtitle}</p> : null}
      {action}
    </div>
  );
}
