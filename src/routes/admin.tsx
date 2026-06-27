import { useNavigate, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Download,
  LogOut,
  Loader2,
  Search,
  Trash2,
  FileText,
  ShieldCheck,
  Inbox,
  Pencil,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useI18n } from "@/lib/i18n";

interface Complaint {
  id: string;
  complaint_no: string;
  full_name: string;
  phone: string;
  email: string | null;
  assembly_constituency: string;
  village: string;
  ward_number: number;
  pincode: string;
  pdf_path: string;
  status: string;
  pending_reason: string;
  last_updated: string;
  created_at: string;
}

const COMPLAINT_STATUSES = ["Pending", "Resolved"];

const PAGE_SIZE = 10;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { t } = useI18n();

  useEffect(() => {
    document.title = "Admin Dashboard · 129 - ATHOOR Portal";
  }, []);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<Complaint | null>(null);

  // Edit Status state
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editPendingReason, setEditPendingReason] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate("/auth", { replace: true });
      return;
    }
    if (active) {
      setChecking(false);
      load(token);
    }
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load(tokenOverride?: string) {
    const token = tokenOverride || localStorage.getItem("admin_token");
    if (!token) {
      navigate("/auth", { replace: true });
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/complaints`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error(t("admin.requireAdmin"));
          localStorage.removeItem("admin_token");
          navigate("/auth", { replace: true });
          return;
        }
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to load complaints.");
      }

      const data = await response.json();
      setComplaints(data || []);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to load complaints.");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return complaints.filter((c) => {
      if (q) {
        const inText =
          c.full_name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          String(c.ward_number).includes(q) ||
          c.complaint_no.toLowerCase().includes(q) ||
          (c.village || "").toLowerCase().includes(q);
        if (!inText) return false;
      }
      if (dateFrom && new Date(c.created_at) < new Date(dateFrom)) return false;
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        if (new Date(c.created_at) > end) return false;
      }
      return true;
    });
  }, [complaints, search, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, dateFrom, dateTo]);

  async function downloadPdf(c: Complaint) {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      toast.error(t("admin.requireAdmin"));
      navigate("/auth", { replace: true });
      return;
    }
    const downloadUrl = `${API_URL}/api/complaints/${c.id}/download?token=${token}`;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `${c.complaint_no}.pdf`;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  async function confirmDelete() {
    if (!toDelete) return;
    const c = toDelete;
    setToDelete(null);

    const token = localStorage.getItem("admin_token");
    if (!token) {
      toast.error(t("admin.requireAdmin"));
      navigate("/auth", { replace: true });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/complaints/${c.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error(t("admin.requireAdmin"));
          localStorage.removeItem("admin_token");
          navigate("/auth", { replace: true });
          return;
        }
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to delete complaint.");
      }

      toast.success(t("admin.deleted"));
      setComplaints((prev) => prev.filter((x) => x.id !== c.id));
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to delete complaint.");
    }
  }

  function openEditDialog(c: Complaint) {
    setEditingComplaint(c);
    setEditStatus(c.status || "Pending");
    setEditPendingReason(c.pending_reason || "");
  }

  async function saveEditStatus() {
    if (!editingComplaint) return;
    const token = localStorage.getItem("admin_token");
    if (!token) {
      toast.error(t("admin.requireAdmin"));
      navigate("/auth", { replace: true });
      return;
    }

    setEditSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/complaints/${editingComplaint.id}/status`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: editStatus,
          pendingReason: editStatus === "Pending" ? editPendingReason : "",
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error(t("admin.requireAdmin"));
          localStorage.removeItem("admin_token");
          navigate("/auth", { replace: true });
          return;
        }
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to update status.");
      }

      const data = await response.json();
      const updated = data.complaint;

      setComplaints((prev) =>
        prev.map((x) => (x.id === updated.id ? { ...x, ...updated } : x))
      );
      toast.success(t("admin.updated"));
      setEditingComplaint(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update status.");
    } finally {
      setEditSaving(false);
    }
  }

  async function signOut() {
    localStorage.removeItem("admin_token");
    navigate("/auth", { replace: true });
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-hero">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 gap-3">
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-brand text-brand-foreground">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight truncate">{t("admin.title")}</p>
              <p className="text-xs text-muted-foreground leading-tight truncate">
                {t("brand.short")}
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" /> <span className="hidden sm:inline">{t("admin.signOut")}</span>
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label={t("admin.stat.total")}
            value={complaints.length}
            icon={<Inbox className="h-5 w-5" />}
          />
          <StatCard
            label={t("admin.stat.today")}
            value={complaints.filter((c) => isToday(c.created_at)).length}
            icon={<FileText className="h-5 w-5" />}
          />
          <StatCard
            label={t("admin.stat.filtered")}
            value={filtered.length}
            icon={<Search className="h-5 w-5" />}
          />
        </div>

        <Card className="p-4 sm:p-6 shadow-card">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2 relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("admin.search.ph")}
                className="pl-9"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">{t("admin.dateFrom")}</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">{t("admin.dateTo")}</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>

          <div className="mt-6 overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead>{t("admin.col.id")}</TableHead>
                  <TableHead>{t("admin.col.name")}</TableHead>
                  <TableHead>{t("admin.col.phone")}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("admin.col.email")}</TableHead>
                  <TableHead className="hidden lg:table-cell">{t("admin.col.constituency")}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("admin.col.village")}</TableHead>
                  <TableHead>{t("admin.col.ward")}</TableHead>
                  <TableHead>{t("admin.col.pincode")}</TableHead>
                  <TableHead>{t("admin.col.pdf")}</TableHead>
                  <TableHead>{t("admin.col.submitted")}</TableHead>
                  <TableHead>{t("admin.col.status")}</TableHead>
                  <TableHead className="hidden xl:table-cell">{t("admin.col.pendingReason")}</TableHead>
                  <TableHead className="hidden lg:table-cell">{t("admin.col.lastUpdated")}</TableHead>
                  <TableHead className="text-right">{t("admin.col.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={14} className="py-12 text-center">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin text-brand" />
                    </TableCell>
                  </TableRow>
                ) : pageRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={14} className="py-12 text-center text-muted-foreground">
                      {t("admin.empty")}
                    </TableCell>
                  </TableRow>
                ) : (
                  pageRows.map((c) => (
                    <TableRow key={c.id} className="hover:bg-secondary/40">
                      <TableCell className="font-mono text-xs">{c.complaint_no}</TableCell>
                      <TableCell className="font-medium">{c.full_name}</TableCell>
                      <TableCell>{c.phone}</TableCell>
                      <TableCell className="hidden md:table-cell">{c.email ?? "—"}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {c.assembly_constituency}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs">{c.village || "—"}</TableCell>
                      <TableCell>{c.ward_number}</TableCell>
                      <TableCell>{c.pincode}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => downloadPdf(c)}>
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap">
                        {new Date(c.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={c.status} />
                      </TableCell>
                      <TableCell className="hidden xl:table-cell text-xs max-w-[140px] truncate">
                        {c.pending_reason || "—"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs whitespace-nowrap">
                        {c.last_updated ? new Date(c.last_updated).toLocaleString() : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-brand hover:text-brand hover:bg-brand-soft/30"
                            onClick={() => openEditDialog(c)}
                            title={t("admin.edit")}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setToDelete(c)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {filtered.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
              <p className="text-muted-foreground">
                {t("admin.page", { current: currentPage, total: totalPages, n: filtered.length })}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  {t("admin.prev")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  {t("admin.next")}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </section>

      {/* Edit Status Dialog */}
      <AlertDialog open={!!editingComplaint} onOpenChange={(o) => !o && setEditingComplaint(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.editStatus.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {editingComplaint?.complaint_no}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-2 block text-sm font-medium">
                {t("admin.editStatus.status")}
              </Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger id="edit-status-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMPLAINT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {editStatus === "Pending" && (
              <div>
                <Label className="mb-2 block text-sm font-medium">
                  {t("admin.editStatus.pendingReason")}
                </Label>
                <textarea
                  id="edit-pending-reason"
                  value={editPendingReason}
                  onChange={(e) => setEditPendingReason(e.target.value)}
                  placeholder={t("admin.editStatus.pendingReason.ph")}
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                />
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={editSaving}>
              {t("admin.editStatus.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={saveEditStatus}
              disabled={editSaving}
              className="bg-gradient-brand text-brand-foreground hover:opacity-95"
            >
              {editSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                t("admin.editStatus.save")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirm Dialog */}
      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.delete.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.delete.desc", { id: toDelete?.complaint_no ?? "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("admin.delete.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("admin.delete.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { cls: string; label: string }> = {
    Pending: { cls: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300", label: "Pending" },
    Resolved: { cls: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300", label: "Resolved" },
  };
  const c = config[status] ?? { cls: "bg-secondary text-secondary-foreground", label: status };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${c.cls}`}>
      {c.label}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card className="p-5 shadow-soft flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-3xl font-bold tracking-tight">{value}</p>
      </div>
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-soft text-brand">
        {icon}
      </div>
    </Card>
  );
}

function isToday(iso: string) {
  const d = new Date(iso);
  const n = new Date();
  return (
    d.getFullYear() === n.getFullYear() &&
    d.getMonth() === n.getMonth() &&
    d.getDate() === n.getDate()
  );
}
