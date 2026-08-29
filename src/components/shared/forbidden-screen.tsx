import { Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";

/** 403 surface shared by every guarded route. */
export function ForbiddenScreen({
  title = "Yetkiniz yok",
  description = "Bu sayfayı görüntülemek için gerekli yetkiye sahip değilsiniz.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 text-center">
      <div className="max-w-md">
        <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <ShieldAlert className="size-6" aria-hidden />
        </span>
        <h1 className="mt-4 text-2xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <div className="mt-6 flex justify-center gap-4 text-sm font-medium">
          <Link to="/panel" className="text-primary hover:underline">
            Panele dön
          </Link>
          <Link to="/" className="text-muted-foreground hover:underline">
            Ana sayfa
          </Link>
        </div>
      </div>
    </div>
  );
}
