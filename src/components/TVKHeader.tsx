import { Link } from "react-router-dom";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ClipboardList } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface TVKHeaderProps {
  /** Show navigation links appropriate to the current page */
  variant?: "home" | "check-status" | "admin";
}

export function TVKHeader({ variant = "home" }: TVKHeaderProps) {
  const { t } = useI18n();

  return (
    <header
      style={{
        background: "#ffffff",
        borderBottom: "3px solid #F4B400",
        boxShadow: "0 2px 16px rgba(161,15,20,0.10)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
      className="tvk-header-wrap"
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}
        className="tvk-header-flex"
      >
        {/* Left: Logo + Title block */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "14px", textDecoration: "none", minWidth: 0 }} className="tvk-logo-title-link">
          {/* TVK Logo */}
          <img
            src="/tvk-logo.png"
            alt="TVK Logo"
            style={{
              width: "60px",
              height: "60px",
              objectFit: "contain",
              flexShrink: 0,
              borderRadius: "8px",
            }}
            className="tvk-logo-img"
          />
          {/* Title block */}
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "#A10F14",
                lineHeight: 1.2,
                margin: 0,
                letterSpacing: "0.01em",
              }}
              className="tvk-title-text"
            >
              Tamilaga Vettri Kazhagam
            </p>
            <p
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#1a1a1a",
                lineHeight: 1.3,
                margin: "2px 0 0",
              }}
              className="tvk-subtitle-text"
            >
              Customer Complaint Portal
            </p>
            <p
              style={{
                fontSize: "11px",
                color: "#6b6b6b",
                lineHeight: 1.3,
                margin: "1px 0 0",
              }}
              className="tvk-subtext"
            >
              Assembly Constituency – 129 ATHOOR
            </p>
          </div>
        </Link>

        {/* Right: Nav + Language toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }} className="tvk-nav-container">
          <LanguageToggle />
          {variant === "home" && (
            <>
              <Link
                to="/check-status"
                style={{
                  display: "none",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#A10F14",
                  textDecoration: "none",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "1px solid #A10F14",
                  transition: "background 0.15s",
                }}
                className="sm-flex"
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#fdeaea";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <ClipboardList style={{ width: 14, height: 14 }} />
                {t("nav.checkStatus")}
              </Link>
              <Link
                to="/auth"
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#6b6b6b",
                  textDecoration: "none",
                  padding: "6px 10px",
                  borderRadius: "8px",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "#A10F14";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "#6b6b6b";
                }}
              >
                {t("nav.admin")}
              </Link>
            </>
          )}
          {variant === "check-status" && (
            <Link
              to="/"
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "#6b6b6b",
                textDecoration: "none",
                padding: "6px 12px",
                borderRadius: "8px",
                border: "1px solid #e5e5e5",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#A10F14";
                (e.currentTarget as HTMLElement).style.borderColor = "#A10F14";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#6b6b6b";
                (e.currentTarget as HTMLElement).style.borderColor = "#e5e5e5";
              }}
            >
              ← Home
            </Link>
          )}
        </div>
      </div>

      {/* Responsive CSS via style tag approach using inline media query via global style */}
      <style>{`
        @media (min-width: 640px) {
          .sm-flex { display: flex !important; }
        }
      `}</style>
    </header>
  );
}

export function TVKFooter() {
  return (
    <footer
      style={{
        background: "linear-gradient(135deg, #A10F14 0%, #7d0b0f 100%)",
        color: "#ffffff",
        padding: "32px 16px",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Gold accent line */}
        <div
          style={{
            width: "48px",
            height: "3px",
            background: "linear-gradient(135deg, #F4B400, #d4a000)",
            borderRadius: "999px",
            margin: "0 auto 20px",
          }}
        />
        <p
          style={{
            fontSize: "16px",
            fontWeight: 700,
            margin: "0 0 4px",
            letterSpacing: "0.02em",
          }}
        >
          Tamilaga Vettri Kazhagam
        </p>
        <p style={{ fontSize: "13px", fontWeight: 500, margin: "0 0 2px", opacity: 0.9 }}>
          Customer Complaint Portal
        </p>
        <p style={{ fontSize: "12px", margin: "0 0 12px", opacity: 0.8 }}>
          Assembly Constituency – 129 ATHOOR
        </p>
        <p
          style={{
            fontSize: "11px",
            opacity: 0.65,
            margin: "0 0 12px",
            fontStyle: "italic",
          }}
        >
          "Designed for efficient public grievance management."
        </p>
        <p style={{ fontSize: "11px", opacity: 0.55, margin: 0 }}>
          © {new Date().getFullYear()} 129 - ATHOOR Constituency Office. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
