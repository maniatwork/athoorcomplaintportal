import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, ShieldCheck, ArrowLeft } from "lucide-react";
import { z } from "zod";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useI18n } from "@/lib/i18n";

const credSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(72),
});

export default function AuthPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Admin Sign In · 129 - ATHOOR Portal";
    const token = localStorage.getItem("admin_token");
    if (token) navigate("/admin", { replace: true });
  }, [navigate]);

  async function signIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = credSchema.safeParse({
      email: fd.get("email"),
      password: fd.get("password"),
    });
    if (!parsed.success) {
      toast.error(t("auth.invalid"));
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed.data),
      });

      setLoading(false);
      if (!response.ok) {
        toast.error(t("auth.invalid"));
        return;
      }

      const data = await response.json();
      localStorage.setItem("admin_token", data.token);
      navigate("/admin", { replace: true });
    } catch (err) {
      setLoading(false);
      console.error(err);
      toast.error(t("auth.invalid"));
    }
  }

  return (
    <main className="min-h-screen bg-gradient-hero flex items-center justify-center px-4 py-12 relative">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-6 inline-flex items-center justify-center gap-2 w-full text-sm text-muted-foreground hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" /> {t("auth.backHome")}
        </Link>
        <Card className="p-6 sm:p-8 shadow-card">
          <div className="flex items-center justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-brand text-brand-foreground shadow-soft">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-center">{t("auth.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground text-center">{t("auth.subtitle")}</p>

          <form onSubmit={signIn} className="space-y-4 mt-6">
            <div>
              <Label className="mb-1.5 block">{t("auth.email")}</Label>
              <Input name="email" type="email" required placeholder="admin@example.com" />
            </div>
            <div>
              <Label className="mb-1.5 block">{t("auth.password")}</Label>
              <Input name="password" type="password" required minLength={6} />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-brand text-brand-foreground"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("auth.signingIn")}
                </>
              ) : (
                t("auth.signIn")
              )}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
