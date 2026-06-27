import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  ShieldCheck,
  ClipboardList,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useI18n } from "@/lib/i18n";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
    document.title = "Check Complaint Status · 129 - ATHOOR Portal";
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

  const statusConfig = result
    ? getStatusConfig(result.status)
    : null;

  return (
    <main className="min-h-screen bg-gradient-hero">
      {/* Header */}
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
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-brand transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("status.backHome")}
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

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-4 pt-12 pb-8 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-brand">
          <ClipboardList className="h-3.5 w-3.5" />
          {t("status.badge")}
        </span>
        <h1 className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight">{t("status.title")}</h1>
        <p className="mt-4 text-muted-foreground sm:text-lg max-w-xl mx-auto">{t("status.desc")}</p>
      </section>

      {/* Search Card */}
      <section className="mx-auto max-w-3xl px-4 pb-20 space-y-6">
        <Card className="p-6 sm:p-8 shadow-card">
          <form onSubmit={handleCheck} className="space-y-4">
            <div>
              <Label htmlFor="complaint-id-input" className="mb-2 block text-sm font-medium">
                {t("status.complaintId")} <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-3">
                <Input
                  id="complaint-id-input"
                  value={complaintId}
                  onChange={(e) => setComplaintId(e.target.value)}
                  placeholder={t("status.complaintId.ph")}
                  className="flex-1 font-mono"
                  required
                  autoComplete="off"
                />
                <Button
                  id="check-status-btn"
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-brand text-brand-foreground shadow-soft hover:opacity-95 shrink-0"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("status.checking")}
                    </>
                  ) : (
                    t("status.check")
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Card>

        {/* Not Found */}
        {notFound && (
          <Card className="p-6 shadow-card border-destructive/30 bg-destructive/5 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col items-center gap-3 text-center py-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                <XCircle className="h-7 w-7 text-destructive" />
              </div>
              <p className="text-base font-semibold text-destructive">{t("status.notFound")}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={resetSearch}
                className="mt-1"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </Card>
        )}

        {/* Result Card */}
        {result && statusConfig && (
          <Card
            className={`p-6 sm:p-8 shadow-card border-2 animate-in fade-in slide-in-from-bottom-4 ${statusConfig.borderClass}`}
          >
            {/* Status Header */}
            <div className={`flex items-center gap-4 p-4 rounded-xl mb-6 ${statusConfig.bgClass}`}>
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${statusConfig.iconBgClass}`}>
                {statusConfig.icon}
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-widest opacity-70">
                  {t("status.card.status")}
                </p>
                <p className={`text-xl font-bold ${statusConfig.textClass}`}>
                  {result.status}
                </p>
                <p className="text-sm opacity-80 mt-0.5">{result.status_description}</p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailRow label={t("status.card.id")} value={result.complaint_id} mono />
              <DetailRow label={t("status.card.name")} value={result.customer_name} />
              <DetailRow label={t("status.card.village")} value={result.village || "—"} />
              <DetailRow label={t("status.card.constituency")} value={result.assembly_constituency} />
              <DetailRow label={t("status.card.ward")} value={String(result.ward_number)} />
              <DetailRow
                label={t("status.card.submitted")}
                value={new Date(result.submitted_date).toLocaleString()}
              />
              <DetailRow
                label={t("status.card.lastUpdated")}
                value={new Date(result.last_updated).toLocaleString()}
              />
            </div>

            {/* Complaint Update / Reason — shown only for Pending */}
            {result.status === "Pending" && result.pending_reason && (
              <div className="mt-4 rounded-lg border border-amber-300/50 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-700/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400 mb-1">
                  {t("status.card.pendingReason")}
                </p>
                <p className="text-sm text-amber-900 dark:text-amber-200">{result.pending_reason}</p>
              </div>
            )}

            {/* Reset button */}
            <div className="mt-6 flex justify-end">
              <Button variant="outline" size="sm" onClick={resetSearch}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Check Another
              </Button>
            </div>
          </Card>
        )}
      </section>

      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        {t("footer.copy", { year: new Date().getFullYear() })}
      </footer>
    </main>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className={`text-sm font-semibold ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

type StatusType = "Pending" | "Resolved";

function getStatusConfig(status: StatusType) {
  switch (status) {
    case "Resolved":
      return {
        borderClass: "border-green-400/50",
        bgClass: "bg-green-50 dark:bg-green-950/30",
        iconBgClass: "bg-green-100 dark:bg-green-900/50",
        icon: <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />,
        textClass: "text-green-700 dark:text-green-400",
      };
    case "Pending":
    default:
      return {
        borderClass: "border-amber-400/50",
        bgClass: "bg-amber-50 dark:bg-amber-950/30",
        iconBgClass: "bg-amber-100 dark:bg-amber-900/50",
        icon: <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />,
        textClass: "text-amber-700 dark:text-amber-400",
      };
  }
}
