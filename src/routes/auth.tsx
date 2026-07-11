import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, ShieldCheck, ArrowLeft } from "lucide-react";
import { z } from "zod";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LanguageToggle } from "@/components/LanguageToggle";
import { TVKFooter } from "@/components/TVKHeader";
import { useI18n } from "@/lib/i18n";

const TVK_RED = "#A10F14";
const TVK_RED_DARK = "#7d0b0f";
const TVK_GOLD = "#F4B400";
const TVK_CREAM = "#FFF8E6";

const credSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(72),
});

export default function AuthPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Admin Sign In · 129 - ATHOOR Portal | Tamilaga Vettri Kazhagam";
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
    <main
      style={{
        minHeight: "100vh",
        background: `linear-gradient(160deg, ${TVK_CREAM} 0%, #ffffff 50%, #fdeaea 100%)`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Mini Header */}
      <header
        style={{
          background: "#ffffff",
          borderBottom: "3px solid #F4B400",
          boxShadow: "0 2px 16px rgba(161,15,20,0.08)",
        }}
        className="tvk-header-wrap"
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
          className="tvk-header-flex"
        >
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }} className="tvk-logo-title-link">
            <img
              src="/tvk-logo.png"
              alt="TVK Logo"
              style={{ width: "48px", height: "48px", objectFit: "contain", borderRadius: "8px" }}
              className="tvk-logo-img"
            />
            <div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: TVK_RED, margin: 0, lineHeight: 1.2 }} className="tvk-title-text">
                Tamilaga Vettri Kazhagam
              </p>
              <p style={{ fontSize: "11px", color: "#888", margin: "2px 0 0" }} className="tvk-subtext">
                Admin Portal · 129 ATHOOR
              </p>
            </div>
          </Link>
          <LanguageToggle />
        </div>
      </header>

      {/* Auth Card */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 16px",
        }}
      >
        <div style={{ width: "100%", maxWidth: "420px" }}>
          {/* Back link */}
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              color: "#888",
              textDecoration: "none",
              marginBottom: "24px",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = TVK_RED)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#888")}
          >
            <ArrowLeft style={{ width: 14, height: 14 }} />
            {t("auth.backHome")}
          </Link>

          {/* Card */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              boxShadow: "0 4px 32px -8px rgba(161,15,20,0.15), 0 2px 8px rgba(0,0,0,0.06)",
              border: "1px solid #e5e5e5",
              borderTop: `4px solid ${TVK_RED}`,
              overflow: "hidden",
            }}
          >
            {/* Card Header Band */}
            <div
              style={{
                background: `linear-gradient(135deg, ${TVK_RED} 0%, ${TVK_RED_DARK} 100%)`,
                padding: "28px 32px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 14px",
                  border: "2px solid rgba(255,255,255,0.3)",
                }}
              >
                <ShieldCheck style={{ width: 30, height: 30, color: "#ffffff" }} />
              </div>
              <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#ffffff", margin: "0 0 4px" }}>
                {t("auth.title")}
              </h1>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", margin: 0 }}>
                {t("auth.subtitle")}
              </p>
            </div>

            {/* Gold accent */}
            <div
              style={{
                height: "3px",
                background: `linear-gradient(135deg, ${TVK_GOLD}, #d4a000)`,
              }}
            />

            {/* Form */}
            <div style={{ padding: "28px 32px" }}>
              <form onSubmit={signIn} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div>
                  <Label
                    style={{ fontSize: "13px", fontWeight: 600, color: "#333", display: "block", marginBottom: "6px" }}
                  >
                    {t("auth.email")}
                  </Label>
                  <Input
                    name="email"
                    type="email"
                    required
                    placeholder="admin@example.com"
                    style={{ borderRadius: "10px", borderColor: "#e5e5e5", fontSize: "14px" }}
                    className="mobile-input"
                  />
                </div>
                <div>
                  <Label
                    style={{ fontSize: "13px", fontWeight: 600, color: "#333", display: "block", marginBottom: "6px" }}
                  >
                    {t("auth.password")}
                  </Label>
                  <Input
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    style={{ borderRadius: "10px", borderColor: "#e5e5e5", fontSize: "14px" }}
                    className="mobile-input"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: loading
                      ? "#d1d5db"
                      : `linear-gradient(135deg, ${TVK_RED}, ${TVK_RED_DARK})`,
                    color: "#fff",
                    border: "none",
                    padding: "13px 24px",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    boxShadow: loading ? "none" : "0 4px 14px rgba(161,15,20,0.25)",
                    marginTop: "4px",
                    letterSpacing: "0.02em",
                    transition: "opacity 0.2s",
                  }}
                  className="mobile-btn"
                  onMouseEnter={(e) => {
                    if (!loading) (e.currentTarget as HTMLElement).style.opacity = "0.92";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.opacity = "1";
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} />
                      {t("auth.signingIn")}
                    </>
                  ) : (
                    t("auth.signIn")
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Back to portal note */}
          <p style={{ textAlign: "center", fontSize: "12px", color: "#aaa", marginTop: "20px" }}>
            Tamilaga Vettri Kazhagam · Assembly Constituency 129 – ATHOOR
          </p>
        </div>
      </div>

      <TVKFooter />

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
