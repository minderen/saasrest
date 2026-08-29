import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { QrCode } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/modules/auth";

/** Only same-origin panel paths may be used as a post-login destination. */
function safeRedirect(value: unknown): string {
  const path = typeof value === "string" ? value : "";
  return path.startsWith("/") && !path.startsWith("//") ? path : "/panel";
}

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({ redirect: safeRedirect(search["redirect"]) }),
  head: () => ({
    meta: [
      { title: "Panel girişi · QR Sofra" },
      { name: "description", content: "QR Sofra yönetim paneline giriş yapın veya yeni hesap oluşturun." },
      { property: "og:title", content: "Panel girişi · QR Sofra" },
      { property: "og:description", content: "Marka, acente ve platform yönetimi için QR Sofra paneline giriş." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const { user, loading } = useAuth();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!loading && user) void navigate({ to: redirect, replace: true });
  }, [loading, user, navigate, redirect]);


  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setPending(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });
    setPending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    void navigate({ to: "/panel" });
  }

  async function signUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setPending(true);
    const { error } = await supabase.auth.signUp({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      options: {
        emailRedirectTo: `${window.location.origin}/auth`,
        data: { full_name: String(formData.get("name") ?? "") },
      },
    });
    setPending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Hesabınız oluşturuldu. E-postanızı doğrulayın.");
  }

  async function signInWithGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      toast.error("Google ile giriş başarısız");
      return;
    }
    if (result.redirected) return;
    void navigate({ to: "/panel" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2 font-semibold">
          <span className="inline-flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <QrCode className="size-5" aria-hidden />
          </span>
          QR Sofra
        </Link>
        <div className="surface-card p-6">
          <Tabs defaultValue="signin">
            <TabsList className="w-full">
              <TabsTrigger value="signin" className="flex-1">
                Giriş yap
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex-1">
                Kayıt ol
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={signIn} className="mt-6 flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="signin-email">E-posta</Label>
                  <Input id="signin-email" name="email" type="email" required autoComplete="email" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="signin-password">Şifre</Label>
                  <Input id="signin-password" name="password" type="password" required autoComplete="current-password" />
                </div>
                <Button type="submit" disabled={pending}>
                  Giriş yap
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={signUp} className="mt-6 flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="signup-name">Ad Soyad</Label>
                  <Input id="signup-name" name="name" required autoComplete="name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="signup-email">E-posta</Label>
                  <Input id="signup-email" name="email" type="email" required autoComplete="email" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="signup-password">Şifre</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                </div>
                <Button type="submit" disabled={pending}>
                  Hesap oluştur
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            veya
            <span className="h-px flex-1 bg-border" />
          </div>
          <Button variant="outline" className="w-full" onClick={signInWithGoogle}>
            Google ile devam et
          </Button>
        </div>
      </div>
    </div>
  );
}
