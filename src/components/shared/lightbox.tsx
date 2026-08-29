import type { ReactNode } from "react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function Lightbox({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = "lg",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string | null;
  description?: string | null;
  children?: ReactNode;
  size?: "md" | "lg" | "xl";
}) {
  const width = size === "xl" ? "sm:max-w-4xl" : size === "lg" ? "sm:max-w-2xl" : "sm:max-w-lg";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${width} max-h-[88vh] overflow-y-auto border-border bg-popover`}>
        <DialogHeader>
          {title ? <DialogTitle className="text-2xl">{title}</DialogTitle> : null}
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
