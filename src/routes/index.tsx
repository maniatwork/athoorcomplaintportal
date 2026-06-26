import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { FileText, Loader2, Upload, ShieldCheck, CheckCircle2, ClipboardList } from "lucide-react";

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
import { useI18n } from "@/lib/i18n";
import { VILLAGES } from "@/lib/villages";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "129 - ATHOOR Complaint Submission Portal" },
      {
        name: "description",
        content:
          "Submit your complaint to the 129 - ATHOOR constituency office. Upload your complaint as a PDF.",
      },
    ],
  }),
  component: ComplaintPortal,
});

const MAX_PDF_BYTES = 10 * 1024 * 1024;

function ComplaintPortal() {
  const { t } = useI18n();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ complaintNo: string } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [selectedVillage, setSelectedVillage] = useState("");

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
      <main className="min-h-screen bg-gradient-hero">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
          <Card className="p-8 sm:p-12 shadow-card text-center animate-in fade-in zoom-in-95">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-soft">
              <CheckCircle2 className="h-9 w-9 text-brand" />
            </div>
            <h1 className="mt-6 text-2xl sm:text-3xl font-bold tracking-tight">
              {t("success.title")}
            </h1>
            <p className="mt-3 text-muted-foreground">{t("success.desc")}</p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-soft px-4 py-2 text-sm font-medium text-brand">
              {t("success.id")}: <span className="font-mono">{success.complaintNo}</span>
            </div>
            <div className="mt-8">
              <Button
                onClick={() => setSuccess(null)}
                className="bg-gradient-brand text-brand-foreground"
              >
                {t("success.again")}
              </Button>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-hero">
      <header className="border-b border-border/60 bg-background/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-brand text-brand-foreground shadow-soft">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight truncate">{t("brand.short")}</p>
              <p className="text-xs text-muted-foreground leading-tight truncate">
                {t("brand.tagline")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Link
              to="/check-status"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-brand transition-colors"
            >
              <ClipboardList className="h-4 w-4" />
              {t("nav.checkStatus")}
            </Link>
            <Link
              to="/auth"
              className="hidden sm:inline text-sm font-medium text-muted-foreground hover:text-brand transition-colors"
            >
              {t("nav.admin")}
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 pt-12 pb-8 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-brand">
          {t("home.badge")}
        </span>
        <h1 className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight">{t("home.title")}</h1>
        <p className="mt-4 text-muted-foreground sm:text-lg max-w-xl mx-auto">{t("home.desc")}</p>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-20">
        <Card className="p-6 sm:p-10 shadow-card">
          <form onSubmit={onSubmit} className="space-y-6" noValidate>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label={t("form.fullName")} required>
                <Input name="full_name" required maxLength={200} placeholder={t("form.fullName.ph")} />
              </Field>
              <Field label={t("form.phone")} required>
                <Input
                  name="phone"
                  type="tel"
                  required
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  placeholder={t("form.phone.ph")}
                />
              </Field>
              <Field label={t("form.email")} hint={t("form.optional")}>
                <Input name="email" type="email" placeholder={t("form.email.ph")} maxLength={255} />
              </Field>
              <Field label={t("form.constituency")} required>
                <Input value="129 - ATHOOR" readOnly className="bg-muted cursor-not-allowed" />
              </Field>
              <Field label={t("form.village")} required>
                <Select
                  name="village"
                  value={selectedVillage}
                  onValueChange={setSelectedVillage}
                  required
                >
                  <SelectTrigger id="village-select">
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
              </Field>
              <Field label={t("form.ward")} required>
                <Input
                  name="ward_number"
                  type="number"
                  min={1}
                  step={1}
                  required
                  placeholder={t("form.ward.ph")}
                />
              </Field>
              <Field label={t("form.pincode")} required>
                <Input
                  name="pincode"
                  type="text"
                  required
                  inputMode="numeric"
                  pattern="[1-9][0-9]{5}"
                  maxLength={6}
                  placeholder={t("form.pincode.ph")}
                />
              </Field>
            </div>

            <div>
              <Label className="mb-2 block text-sm font-medium">
                {t("form.uploadLabel")} <span className="text-destructive">*</span>
              </Label>
              <label
                htmlFor="pdf"
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/40 px-6 py-8 text-center transition-colors hover:border-brand hover:bg-brand-soft/40"
              >
                {file ? (
                  <>
                    <FileText className="h-8 w-8 text-brand" />
                    <p className="mt-2 text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB · {t("form.uploadReplace")}
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm font-medium">{t("form.uploadCta")}</p>
                    <p className="text-xs text-muted-foreground">{t("form.uploadHint")}</p>
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
              {fileError && <p className="mt-2 text-sm text-destructive">{fileError}</p>}
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="w-full bg-gradient-brand text-brand-foreground shadow-soft hover:opacity-95 h-12 text-base"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t("form.submitting")}
                </>
              ) : (
                t("form.submit")
              )}
            </Button>
          </form>
        </Card>
      </section>

      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        {t("footer.copy", { year: new Date().getFullYear() })}
      </footer>
    </main>
  );
}

function Field({
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
      <Label className="mb-2 flex items-center justify-between text-sm font-medium">
        <span>
          {label}
          {required && <span className="text-destructive"> *</span>}
        </span>
        {hint && <span className="text-xs font-normal text-muted-foreground">{hint}</span>}
      </Label>
      {children}
    </div>
  );
}
