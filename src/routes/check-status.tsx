import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  ClipboardList,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LanguageToggle } from "@/components/LanguageToggle";
import { TVKFooter } from "@/components/TVKHeader";
import { useI18n } from "@/lib/i18n";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const TVK_RED = "#A10F14";
const TVK_RED_DARK = "#7d0b0f";
const TVK_GOLD = "#F4B400";
const TVK_CREAM = "#FFF8E6";

interface ComplaintStatus {
  complaint_id: string;
  customer_name: string;
  village: string;
  assembly_constituency: string;
  ward_number: number;
  submitted_date: string;
  status: "Pending" | "Resolved";
  status_description: string;
  pending_reason: string;
  last_updated: string;
}

export default function CheckStatusPage() {
  useEffect(() => {
    document.title = "Check Complaint Status · 129 - ATHOOR Portal | Tamilaga Vettri Kazhagam";
  }, []);
  const { t } = useI18n();
  const [complaintId, setComplaintId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComplaintStatus | null>(null);
  const [notFound, setNotFound] = useState(false);

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    const id = complaintId.trim();
    if (!id) {
      toast.error(t("status.err.required"));
      return;
    }

    setLoading(true);
    setResult(null);
    setNotFound(false);

    try {
      const response = await fetch(`${API_URL}/api/complaints/status/${encodeURIComponent(id)}`);
      if (response.status === 404) {
        setNotFound(true);
        return;
      }
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to fetch complaint status.");
      }
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to fetch complaint status.");
    } finally {
      setLoading(false);
    }
  }

  function resetSearch() {
    setResult(null);
    setNotFound(false);
    setComplaintId("");
  }

  const statusConfig = result ? getStatusConfig(result.status) : null;

  return (
    <main style={{ minHeight: "100vh", background: "#ffffff", display: "flex", flexDirection: "column" }}>
      {/* TVK Header */}
      <header
        style={{
          background: "#ffffff",
          borderBottom: "3px solid #F4B400",
          boxShadow: "0 2px 16px rgba(161,15,20,0.10)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
            <img
              src="/tvk-logo.png"
              alt="TVK Logo"
              style={{ width: "52px", height: "52px", objectFit: "contain", flexShrink: 0, borderRadius: "8px" }}
            />
            <div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: TVK_RED, margin: 0, lineHeight: 1.2 }}>
                Tamilaga Vettri Kazhagam
              </p>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#1a1a1a", margin: "2px 0 0", lineHeight: 1.2 }}>
                Customer Complaint Portal
              </p>
              <p style={{ fontSize: "10px", color: "#888", margin: "1px 0 0" }}>
                Assembly Constituency – 129 ATHOOR
              </p>
            </div>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <LanguageToggle />
            <Link
              to="/"
              style={{
                fontSize: "12px",
                fontWeight: 500,
                color: "#6b6b6b",
                textDecoration: "none",
                padding: "6px 12px",
                borderRadius: "8px",
                border: "1px solid #e5e5e5",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = TVK_RED;
                (e.currentTarget as HTMLElement).style.borderColor = TVK_RED;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#6b6b6b";
                (e.currentTarget as HTMLElement).style.borderColor = "#e5e5e5";
              }}
            >
              <ArrowLeft style={{ width: 13, height: 13 }} />
              {t("status.backHome")}
            </Link>
            <Link
              to="/auth"
              style={{ fontSize: "12px", fontWeight: 500, color: "#6b6b6b", textDecoration: "none" }}
            >
              {t("nav.admin")}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section
        style={{
          background: `linear-gradient(180deg, ${TVK_CREAM} 0%, #ffffff 100%)`,
          padding: "40px 16px 28px",
          textAlign: "center",
          borderBottom: "1px solid #f0e8d6",
        }}
      >
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "#fdeaea",
              color: TVK_RED,
              fontSize: "11px",
              fontWeight: 700,
              padding: "5px 14px",
              borderRadius: "999px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "14px",
              border: "1px solid rgba(161,15,20,0.15)",
            }}
          >
            <ClipboardList style={{ width: 12, height: 12 }} />
            {t("status.badge")}
          </span>
          <h1
            style={{
              fontSize: "clamp(22px, 5vw, 34px)",
              fontWeight: 800,
              color: "#1a1a1a",
              margin: "0 0 12px",
              letterSpacing: "-0.02em",
            }}
          >
            {t("status.title")}
          </h1>
          <p style={{ color: "#666", fontSize: "14px", lineHeight: 1.7, margin: 0 }}>
            {t("status.desc")}
          </p>
        </div>
      </section>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          maxWidth: "720px",
          margin: "0 auto",
          width: "100%",
          padding: "36px 16px 56px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {/* Search Card */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #e5e5e5",
            borderTop: `4px solid ${TVK_RED}`,
            boxShadow: "0 4px 24px -8px rgba(161,15,20,0.12)",
            padding: "28px",
          }}
        >
          <div style={{ marginBottom: "16px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#1a1a1a", margin: "0 0 4px" }}>
              Track Your Complaint
            </h2>
            <p style={{ fontSize: "12px", color: "#888", margin: 0 }}>
              Enter your Complaint ID to view the current status
            </p>
          </div>

          <form onSubmit={handleCheck}>
            <Label
              htmlFor="complaint-id-input"
              style={{ fontSize: "13px", fontWeight: 600, color: "#333", display: "block", marginBottom: "8px" }}
            >
              {t("status.complaintId")} <span style={{ color: "#dc2626" }}>*</span>
            </Label>
            <div style={{ display: "flex", gap: "10px" }}>
              <Input
                id="complaint-id-input"
                value={complaintId}
                onChange={(e) => setComplaintId(e.target.value)}
                placeholder={t("status.complaintId.ph")}
                style={{ flex: 1, fontFamily: "monospace", borderRadius: "10px", fontSize: "14px" }}
                required
                autoComplete="off"
              />
              <button
                id="check-status-btn"
                type="submit"
                disabled={loading}
                style={{
                  background: loading
                    ? "#d1d5db"
                    : `linear-gradient(135deg, ${TVK_RED}, ${TVK_RED_DARK})`,
                  color: "#fff",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  flexShrink: 0,
                  boxShadow: loading ? "none" : "0 3px 10px rgba(161,15,20,0.25)",
                  whiteSpace: "nowrap",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!loading) (e.currentTarget as HTMLElement).style.opacity = "0.9";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.opacity = "1";
                }}
              >
                {loading ? (
                  <>
                    <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
                    {t("status.checking")}
                  </>
                ) : (
                  t("status.check")
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Not Found */}
        {notFound && (
          <div
            style={{
              background: "#fff5f5",
              borderRadius: "16px",
              border: "1px solid #fecaca",
              borderLeft: "4px solid #dc2626",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
              textAlign: "center",
              animation: "slideUp 0.3s ease",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "#fee2e2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <XCircle style={{ width: 28, height: 28, color: "#dc2626" }} />
            </div>
            <p style={{ fontWeight: 700, color: "#dc2626", fontSize: "15px", margin: 0 }}>
              {t("status.notFound")}
            </p>
            <p style={{ color: "#888", fontSize: "13px", margin: 0 }}>
              Please check your Complaint ID and try again.
            </p>
            <button
              onClick={resetSearch}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#fff",
                border: "1px solid #dc2626",
                color: "#dc2626",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <RefreshCw style={{ width: 13, height: 13 }} />
              Try Again
            </button>
          </div>
        )}

        {/* Result Card */}
        {result && statusConfig && (
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #e5e5e5",
              borderTop: `4px solid ${statusConfig.accentColor}`,
              boxShadow: "0 4px 24px -8px rgba(0,0,0,0.10)",
              overflow: "hidden",
              animation: "slideUp 0.3s ease",
            }}
          >
            {/* Status Header */}
            <div
              style={{
                background: statusConfig.headerBg,
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  background: statusConfig.iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {statusConfig.icon}
              </div>
              <div>
                <p
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#888",
                    margin: "0 0 3px",
                  }}
                >
                  {t("status.card.status")}
                </p>
                <p style={{ fontSize: "20px", fontWeight: 800, color: statusConfig.textColor, margin: "0 0 3px" }}>
                  {result.status}
                </p>
                <p style={{ fontSize: "12px", color: "#666", margin: 0 }}>{result.status_description}</p>
              </div>
            </div>

            {/* Details Grid */}
            <div style={{ padding: "24px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "16px",
                  marginBottom: "16px",
                }}
              >
                <TVKDetailRow label={t("status.card.id")} value={result.complaint_id} mono />
                <TVKDetailRow label={t("status.card.name")} value={result.customer_name} />
                <TVKDetailRow label={t("status.card.village")} value={result.village || "—"} />
                <TVKDetailRow label={t("status.card.constituency")} value={result.assembly_constituency} />
                <TVKDetailRow label={t("status.card.ward")} value={String(result.ward_number)} />
                <TVKDetailRow
                  label={t("status.card.submitted")}
                  value={new Date(result.submitted_date).toLocaleString()}
                />
                <TVKDetailRow
                  label={t("status.card.lastUpdated")}
                  value={new Date(result.last_updated).toLocaleString()}
                />
              </div>

              {/* Pending Reason */}
              {result.status === "Pending" && result.pending_reason && (
                <div
                  style={{
                    background: "#fffbeb",
                    border: "1px solid #fde68a",
                    borderLeft: "4px solid #f59e0b",
                    borderRadius: "10px",
                    padding: "14px 16px",
                    marginBottom: "16px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "#92400e",
                      margin: "0 0 4px",
                    }}
                  >
                    {t("status.card.pendingReason")}
                  </p>
                  <p style={{ fontSize: "13px", color: "#78350f", margin: 0 }}>{result.pending_reason}</p>
                </div>
              )}

              {/* Reset button */}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={resetSearch}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "#fff",
                    border: "1px solid #e5e5e5",
                    color: "#6b6b6b",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = TVK_RED;
                    (e.currentTarget as HTMLElement).style.color = TVK_RED;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "#e5e5e5";
                    (e.currentTarget as HTMLElement).style.color = "#6b6b6b";
                  }}
                >
                  <RefreshCw style={{ width: 12, height: 12 }} />
                  Check Another
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Informational note */}
        {!result && !notFound && (
          <div
            style={{
              background: TVK_CREAM,
              borderRadius: "12px",
              padding: "18px 24px",
              border: "1px solid #f0e8d6",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "13px", color: "#888", margin: "0 0 8px" }}>
              Need to submit a complaint?
            </p>
            <Link
              to="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: `linear-gradient(135deg, ${TVK_GOLD}, #d4a000)`,
                color: "#1a1a1a",
                padding: "8px 18px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Submit a Complaint
            </Link>
          </div>
        )}
      </div>

      <TVKFooter />

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}

function TVKDetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div
      style={{
        background: "#fafafa",
        borderRadius: "8px",
        padding: "10px 12px",
        border: "1px solid #f0f0f0",
      }}
    >
      <p
        style={{
          fontSize: "10px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "#888",
          margin: "0 0 3px",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: "13px",
          fontWeight: 600,
          color: "#1a1a1a",
          margin: 0,
          fontFamily: mono ? "monospace" : "inherit",
        }}
      >
        {value}
      </p>
    </div>
  );
}

type StatusType = "Pending" | "Resolved";

function getStatusConfig(status: StatusType) {
  switch (status) {
    case "Resolved":
      return {
        accentColor: "#16a34a",
        headerBg: "#f0fdf4",
        iconBg: "#dcfce7",
        icon: <CheckCircle2 style={{ width: 26, height: 26, color: "#16a34a" }} />,
        textColor: "#15803d",
      };
    case "Pending":
    default:
      return {
        accentColor: "#f59e0b",
        headerBg: "#fffbeb",
        iconBg: "#fef3c7",
        icon: <Clock style={{ width: 26, height: 26, color: "#d97706" }} />,
        textColor: "#b45309",
      };
  }
}
