import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { FileText, Loader2, Upload, CheckCircle2, ClipboardList, ArrowDown } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LanguageToggle } from "@/components/LanguageToggle";
import { TVKFooter } from "@/components/TVKHeader";
import { useI18n } from "@/lib/i18n";
import { VILLAGES } from "@/lib/villages";

const MAX_PDF_BYTES = 10 * 1024 * 1024;

// TVK color constants
const TVK_RED = "#A10F14";
const TVK_RED_DARK = "#7d0b0f";
const TVK_GOLD = "#F4B400";
const TVK_CREAM = "#FFF8E6";

export default function ComplaintPortal() {
  const { t } = useI18n();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ complaintNo: string } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [selectedVillage, setSelectedVillage] = useState("");

  useEffect(() => {
    document.title = "129 - ATHOOR Complaint Submission Portal | Tamilaga Vettri Kazhagam";
  }, []);

  const schema = z.object({
    full_name: z.string().trim().min(2, t("err.fullName")).max(200),
    phone: z.string().regex(/^[6-9][0-9]{9}$/, t("err.phone")),
    email: z
      .string()
      .trim()
      .email(t("err.email"))
      .max(255)
      .optional()
      .or(z.literal("")),
    ward_number: z.coerce.number().int().positive(t("err.ward")),
    pincode: z.string().regex(/^[1-9][0-9]{5}$/, t("err.pincode")),
    village: z.string().min(1, t("err.village")),
  });

  function handleFile(f: File | null) {
    setFileError(null);
    if (!f) {
      setFile(null);
      return;
    }
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
      setFileError(t("err.pdfType"));
      setFile(null);
      return;
    }
    if (f.size > MAX_PDF_BYTES) {
      setFileError(t("err.pdfSize"));
      setFile(null);
      return;
    }
    setFile(f);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    const formData = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      full_name: formData.get("full_name"),
      phone: formData.get("phone"),
      email: formData.get("email") || "",
      ward_number: formData.get("ward_number"),
      pincode: formData.get("pincode"),
      village: selectedVillage,
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    if (!file) {
      setFileError(t("err.pdfMissing"));
      return;
    }

    setSubmitting(true);
    try {
      const body = new FormData();
      body.append("full_name", parsed.data.full_name);
      body.append("phone", parsed.data.phone);
      body.append("email", parsed.data.email || "");
      body.append("ward_number", String(parsed.data.ward_number));
      body.append("pincode", parsed.data.pincode);
      body.append("village", parsed.data.village);
      body.append("pdf", file);

      const response = await fetch(`${API_URL}/api/complaints`, {
        method: "POST",
        body,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || t("err.submit"));
      }

      const resData = await response.json();
      setSuccess({ complaintNo: resData.complaint_no });
      toast.success(t("toast.success"));
      (e.target as HTMLFormElement).reset();
      setFile(null);
      setSelectedVillage("");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || t("err.submit"));
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <main style={{ minHeight: "100vh", background: TVK_CREAM }}>
        {/* Header */}
        <TVKHomeHeader />
        <div style={{ maxWidth: "560px", margin: "0 auto", padding: "64px 16px" }}>
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "48px 32px",
              textAlign: "center",
              boxShadow: "0 4px 24px -8px rgba(161,15,20,0.15)",
              border: "1px solid #e5e5e5",
              borderTop: `4px solid ${TVK_GOLD}`,
              animation: "fadeIn 0.4s ease",
            }}
          >
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "#f0fdf4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                border: "2px solid #86efac",
              }}
            >
              <CheckCircle2 style={{ width: 36, height: 36, color: "#16a34a" }} />
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1a1a1a", margin: "0 0 8px" }}>
              {t("success.title")}
            </h1>
            <p style={{ color: "#6b6b6b", fontSize: "14px", margin: "0 0 24px" }}>
              {t("success.desc")}
            </p>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "#fdeaea",
                color: TVK_RED,
                padding: "10px 20px",
                borderRadius: "999px",
                fontSize: "14px",
                fontWeight: 600,
                marginBottom: "28px",
              }}
            >
              {t("success.id")}:{" "}
              <span style={{ fontFamily: "monospace", fontWeight: 700 }}>{success.complaintNo}</span>
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => setSuccess(null)}
                style={{
                  background: `linear-gradient(135deg, ${TVK_RED}, ${TVK_RED_DARK})`,
                  color: "#fff",
                  border: "none",
                  padding: "10px 24px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {t("success.again")}
              </button>
              <Link
                to="/check-status"
                style={{
                  background: `linear-gradient(135deg, ${TVK_GOLD}, #d4a000)`,
                  color: "#1a1a1a",
                  padding: "10px 24px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: 600,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <ClipboardList style={{ width: 15, height: 15 }} />
                Track Status
              </Link>
            </div>
          </div>
        </div>
        <TVKFooter />
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#ffffff" }}>
      {/* TVK Header */}
      <TVKHomeHeader />

      {/* Hero Section */}
      <section
        style={{
          background: `linear-gradient(180deg, ${TVK_CREAM} 0%, #ffffff 100%)`,
          padding: "48px 16px 32px",
          borderBottom: "1px solid #f0e8d6",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "32px",
          }}
        >
          {/* Leader Photo + Welcome Message Row */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "32px",
              width: "100%",
            }}
            className="hero-row"
          >
            {/* Leader Photo */}
            <div style={{ flexShrink: 0, textAlign: "center" }}>
              <div
                style={{
                  position: "relative",
                  display: "inline-block",
                }}
              >
                {/* Gold ring */}
                <div
                  style={{
                    position: "absolute",
                    inset: "-4px",
                    borderRadius: "50%",
                    background: `conic-gradient(${TVK_GOLD}, ${TVK_RED}, ${TVK_GOLD})`,
                    zIndex: 0,
                  }}
                />
                <img
                  src="/leader-photo.png"
                  alt="Party Leader"
                  style={{
                    width: "160px",
                    height: "160px",
                    objectFit: "cover",
                    objectPosition: "top",
                    borderRadius: "50%",
                    position: "relative",
                    zIndex: 1,
                    border: "4px solid #ffffff",
                    boxShadow: "0 8px 24px rgba(161,15,20,0.20)",
                  }}
                  className="leader-photo"
                />
              </div>
            </div>

            {/* Hero Text */}
            <div style={{ textAlign: "center", maxWidth: "640px" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  background: "#fdeaea",
                  color: TVK_RED,
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "5px 14px",
                  borderRadius: "999px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "14px",
                  border: `1px solid rgba(161,15,20,0.15)`,
                }}
              >
                {t("home.badge")}
              </span>
              <h1
                style={{
                  fontSize: "clamp(24px, 5vw, 38px)",
                  fontWeight: 800,
                  color: "#1a1a1a",
                  lineHeight: 1.2,
                  margin: "0 0 16px",
                  letterSpacing: "-0.02em",
                }}
              >
                {t("home.title")}
              </h1>
              <p style={{ color: "#555", fontSize: "15px", lineHeight: 1.7, margin: "0 0 24px" }}>
                {t("home.desc")}
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: "#888",
                  fontStyle: "italic",
                  margin: "0 0 24px",
                }}
              >
                "Welcome to the Customer Complaint Portal. We are committed to providing transparent
                and timely grievance resolution."
              </p>
              <a
                href="#complaint-form"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: `linear-gradient(135deg, ${TVK_RED}, ${TVK_RED_DARK})`,
                  color: "#fff",
                  padding: "12px 28px",
                  borderRadius: "12px",
                  fontWeight: 700,
                  fontSize: "14px",
                  textDecoration: "none",
                  boxShadow: "0 4px 14px rgba(161,15,20,0.30)",
                  transition: "box-shadow 0.2s, transform 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(161,15,20,0.40)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(161,15,20,0.30)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
              >
                <ArrowDown style={{ width: 16, height: 16 }} />
                Submit a Complaint
              </a>
            </div>
          </div>

          {/* Stat Pills */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {[
              { label: "Constituency", value: "129 ATHOOR" },
              { label: "Portal", value: "Official" },
              { label: "Response", value: "Timely" },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  background: "#fff",
                  border: "1px solid #e5e5e5",
                  borderTop: `3px solid ${TVK_GOLD}`,
                  borderRadius: "10px",
                  padding: "10px 20px",
                  textAlign: "center",
                  minWidth: "130px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <p style={{ fontSize: "16px", fontWeight: 700, color: TVK_RED, margin: 0 }}>
                  {item.value}
                </p>
                <p style={{ fontSize: "11px", color: "#888", margin: "2px 0 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Complaint Form Section */}
      <section
        id="complaint-form"
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "48px 16px 64px",
        }}
      >
        {/* Section Title */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: "48px",
              height: "3px",
              background: `linear-gradient(135deg, ${TVK_GOLD}, #d4a000)`,
              borderRadius: "999px",
              margin: "0 auto 16px",
            }}
          />
          <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#1a1a1a", margin: "0 0 6px" }}>
            Complaint Submission Form
          </h2>
          <p style={{ fontSize: "13px", color: "#888", margin: 0 }}>
            Fill in the details below and attach your complaint as a PDF
          </p>
        </div>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #e5e5e5",
            borderTop: `4px solid ${TVK_RED}`,
            boxShadow: "0 4px 24px -8px rgba(161,15,20,0.12), 0 2px 8px rgba(0,0,0,0.06)",
            padding: "32px 28px",
            transition: "box-shadow 0.25s ease",
          }}
        >
          <form onSubmit={onSubmit} className="space-y-6" noValidate>
            <div className="grid gap-6 sm:grid-cols-2">
              <TVKField label={t("form.fullName")} required>
                <TVKInput name="full_name" required maxLength={200} placeholder={t("form.fullName.ph")} />
              </TVKField>
              <TVKField label={t("form.phone")} required>
                <TVKInput
                  name="phone"
                  type="tel"
                  required
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  placeholder={t("form.phone.ph")}
                />
              </TVKField>
              <TVKField label={t("form.email")} hint={t("form.optional")}>
                <TVKInput name="email" type="email" placeholder={t("form.email.ph")} maxLength={255} />
              </TVKField>
              <TVKField label={t("form.constituency")} required>
                <TVKInput value="129 - ATHOOR" readOnly className="bg-muted cursor-not-allowed" />
              </TVKField>
              <TVKField label={t("form.village")} required>
                <Select
                  name="village"
                  value={selectedVillage}
                  onValueChange={setSelectedVillage}
                  required
                >
                  <SelectTrigger id="village-select" style={{ borderColor: "#e5e5e5", borderRadius: "10px" }}>
                    <SelectValue placeholder={t("form.village.ph")} />
                  </SelectTrigger>
                  <SelectContent className="max-h-64 overflow-y-auto">
                    {VILLAGES.map((village) => (
                      <SelectItem key={village} value={village}>
                        {village}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TVKField>
              <TVKField label={t("form.ward")} required>
                <TVKInput
                  name="ward_number"
                  type="number"
                  min={1}
                  step={1}
                  required
                  placeholder={t("form.ward.ph")}
                />
              </TVKField>
              <TVKField label={t("form.pincode")} required>
                <TVKInput
                  name="pincode"
                  type="text"
                  required
                  inputMode="numeric"
                  pattern="[1-9][0-9]{5}"
                  maxLength={6}
                  placeholder={t("form.pincode.ph")}
                />
              </TVKField>
            </div>

            {/* PDF Upload */}
            <div>
              <Label className="mb-2 block text-sm font-medium" style={{ color: "#333" }}>
                {t("form.uploadLabel")} <span style={{ color: "#dc2626" }}>*</span>
              </Label>
              <label
                htmlFor="pdf"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "12px",
                  border: `2px dashed ${file ? TVK_RED : "#d1d5db"}`,
                  background: file ? "#fdeaea" : "#fafafa",
                  padding: "32px 24px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "border-color 0.2s, background 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!file) {
                    (e.currentTarget as HTMLElement).style.borderColor = TVK_RED;
                    (e.currentTarget as HTMLElement).style.background = "#fff5f5";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!file) {
                    (e.currentTarget as HTMLElement).style.borderColor = "#d1d5db";
                    (e.currentTarget as HTMLElement).style.background = "#fafafa";
                  }
                }}
              >
                {file ? (
                  <>
                    <FileText style={{ width: 32, height: 32, color: TVK_RED, marginBottom: 8 }} />
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a", margin: "0 0 4px" }}>{file.name}</p>
                    <p style={{ fontSize: "12px", color: "#888", margin: 0 }}>
                      {(file.size / 1024 / 1024).toFixed(2)} MB · {t("form.uploadReplace")}
                    </p>
                  </>
                ) : (
                  <>
                    <Upload style={{ width: 32, height: 32, color: "#9ca3af", marginBottom: 8 }} />
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a", margin: "0 0 4px" }}>{t("form.uploadCta")}</p>
                    <p style={{ fontSize: "12px", color: "#888", margin: 0 }}>{t("form.uploadHint")}</p>
                  </>
                )}
                <input
                  id="pdf"
                  name="pdf"
                  type="file"
                  accept="application/pdf,.pdf"
                  className="sr-only"
                  onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                />
              </label>
              {fileError && (
                <p style={{ marginTop: "6px", fontSize: "12px", color: "#dc2626" }}>{fileError}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%",
                background: submitting
                  ? "#d1d5db"
                  : `linear-gradient(135deg, ${TVK_RED}, ${TVK_RED_DARK})`,
                color: "#fff",
                border: "none",
                padding: "14px 24px",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: 700,
                cursor: submitting ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: submitting ? "none" : "0 4px 14px rgba(161,15,20,0.25)",
                transition: "opacity 0.2s, box-shadow 0.2s",
                letterSpacing: "0.02em",
              }}
              onMouseEnter={(e) => {
                if (!submitting) (e.currentTarget as HTMLElement).style.opacity = "0.92";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = "1";
              }}
            >
              {submitting ? (
                <>
                  <Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} />
                  {t("form.submitting")}
                </>
              ) : (
                t("form.submit")
              )}
            </button>
          </form>
        </div>

        {/* Check Status CTA */}
        <div
          style={{
            marginTop: "24px",
            background: TVK_CREAM,
            borderRadius: "12px",
            padding: "18px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
            border: `1px solid #f0e8d6`,
          }}
        >
          <div>
            <p style={{ fontWeight: 600, color: "#1a1a1a", fontSize: "14px", margin: "0 0 2px" }}>
              Already submitted a complaint?
            </p>
            <p style={{ color: "#888", fontSize: "12px", margin: 0 }}>
              Track the status of your complaint using your Complaint ID
            </p>
          </div>
          <Link
            to="/check-status"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: `linear-gradient(135deg, ${TVK_GOLD}, #d4a000)`,
              color: "#1a1a1a",
              padding: "9px 18px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 700,
              textDecoration: "none",
              flexShrink: 0,
              boxShadow: "0 2px 8px rgba(244,180,0,0.25)",
            }}
          >
            <ClipboardList style={{ width: 14, height: 14 }} />
            Check Status
          </Link>
        </div>
      </section>

      <TVKFooter />

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        @media (min-width: 640px) {
          .hero-row {
            flex-direction: row !important;
            align-items: center !important;
            text-align: left !important;
          }
          .hero-row > div:last-child {
            text-align: left !important;
          }
        }
      `}</style>
    </main>
  );
}

/* TVK-styled form field wrapper */
function TVKField({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label
        className="mb-2 flex items-center justify-between text-sm font-medium"
        style={{ color: "#333" }}
      >
        <span>
          {label}
          {required && <span style={{ color: "#dc2626", marginLeft: "2px" }}>*</span>}
        </span>
        {hint && <span style={{ fontSize: "11px", fontWeight: 400, color: "#888" }}>{hint}</span>}
      </Label>
      {children}
    </div>
  );
}

/* TVK-styled input */
function TVKInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Input
      {...props}
      style={{
        borderRadius: "10px",
        borderColor: "#e5e5e5",
        fontSize: "14px",
        ...props.style,
      }}
    />
  );
}

/* Inline TVK Home Header (to avoid prop drilling issues) */
function TVKHomeHeader() {
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
        {/* Logo + Title */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
          <img
            src="/tvk-logo.png"
            alt="TVK Logo"
            style={{ width: "56px", height: "56px", objectFit: "contain", flexShrink: 0, borderRadius: "8px" }}
          />
          <div>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "#A10F14", margin: 0, lineHeight: 1.2 }}>
              Tamilaga Vettri Kazhagam
            </p>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "#1a1a1a", margin: "2px 0 0", lineHeight: 1.2 }}>
              Customer Complaint Portal
            </p>
            <p style={{ fontSize: "11px", color: "#888", margin: "1px 0 0", lineHeight: 1.2 }}>
              Assembly Constituency – 129 ATHOOR
            </p>
          </div>
        </Link>

        {/* Nav */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <LanguageToggle />
          <Link
            to="/check-status"
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#A10F14",
              textDecoration: "none",
              padding: "6px 12px",
              borderRadius: "8px",
              border: "1px solid #A10F14",
              display: "none",
            }}
            className="nav-check-status"
          >
            Check Status
          </Link>
          <Link
            to="/auth"
            style={{
              fontSize: "12px",
              fontWeight: 500,
              color: "#6b6b6b",
              textDecoration: "none",
              padding: "6px 10px",
            }}
          >
            {t("nav.admin")}
          </Link>
        </div>
      </div>
      <style>{`
        @media (min-width: 640px) {
          .nav-check-status { display: inline-flex !important; align-items: center; }
        }
      `}</style>
    </header>
  );
}
