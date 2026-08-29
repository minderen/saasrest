import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

/** Shared full-page states so routes/themes never duplicate loading markup. */
export function LoadingScreen({ message = "Yükleniyor…" }: { message?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export function EmptyScreen({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
        <div className="mt-6">
          {action ?? (
            <Link to="/" className="text-sm font-medium text-primary hover:underline">
              Ana sayfaya dön
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
