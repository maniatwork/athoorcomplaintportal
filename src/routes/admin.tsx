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
import { TVKFooter } from "@/components/TVKHeader";
import { useI18n } from "@/lib/i18n";

const TVK_RED = "#A10F14";
const TVK_RED_DARK = "#7d0b0f";
const TVK_GOLD = "#F4B400";
const TVK_CREAM = "#FFF8E6";

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
    document.title = "Admin Dashboard · 129 - ATHOOR Portal | Tamilaga Vettri Kazhagam";
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

  function handleComplaintUpdate(updated: Complaint) {
    setComplaints((prev) =>
      prev.map((x) => (x.id === updated.id ? { ...x, ...updated } : x))
    );
  }

  if (checking) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: TVK_CREAM,
        }}
      >
        <Loader2 style={{ width: 28, height: 28, animation: "spin 1s linear infinite", color: TVK_RED }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#f5f5f7", display: "flex", flexDirection: "column" }}>
      {/* Admin Header - Red background */}
      <header
        style={{
          background: `linear-gradient(135deg, ${TVK_RED} 0%, ${TVK_RED_DARK} 100%)`,
          boxShadow: "0 2px 16px rgba(161,15,20,0.25)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
        className="tvk-header-wrap"
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
          className="tvk-header-flex"
        >
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }} className="tvk-logo-title-link">
            <img
              src="/tvk-logo.png"
              alt="TVK Logo"
              style={{
                width: "44px",
                height: "44px",
                objectFit: "contain",
                flexShrink: 0,
                borderRadius: "8px",
                border: "2px solid rgba(255,255,255,0.3)",
              }}
              className="tvk-logo-img"
            />
            <div>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", margin: 0, lineHeight: 1.2 }} className="tvk-title-text">
                {t("admin.title")}
              </p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", margin: "2px 0 0" }} className="tvk-subtext">
                Tamilaga Vettri Kazhagam · 129 ATHOOR
              </p>
            </div>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }} className="tvk-nav-container">
            <LanguageToggle />
            <button
              onClick={signOut}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(255,255,255,0.15)",
                color: "#ffffff",
                border: "1px solid rgba(255,255,255,0.3)",
                padding: "7px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              className="mobile-btn-inline"
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.25)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.15)";
              }}
            >
              <LogOut style={{ width: 13, height: 13 }} />
              <span style={{ display: "none" }} className="admin-signout-text">{t("admin.signOut")}</span>
            </button>
          </div>
        </div>

        {/* Gold bottom accent */}
        <div style={{ height: "3px", background: `linear-gradient(135deg, ${TVK_GOLD}, #d4a000)` }} />

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @media (min-width: 640px) {
            .admin-signout-text { display: inline !important; }
          }
        `}</style>
      </header>

      {/* Dashboard Content */}
      <div style={{ flex: 1, maxWidth: "1400px", margin: "0 auto", width: "100%", padding: "24px 16px 48px" }}>

        {/* Stat Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <AdminStatCard
            label={t("admin.stat.total")}
            value={complaints.length}
            icon={<Inbox style={{ width: 22, height: 22, color: TVK_RED }} />}
            color={TVK_RED}
          />
          <AdminStatCard
            label={t("admin.stat.today")}
            value={complaints.filter((c) => isToday(c.created_at)).length}
            icon={<FileText style={{ width: 22, height: 22, color: TVK_GOLD }} />}
            color={TVK_GOLD}
          />
          <AdminStatCard
            label={t("admin.stat.filtered")}
            value={filtered.length}
            icon={<Search style={{ width: 22, height: 22, color: "#6b7280" }} />}
            color="#6b7280"
          />
        </div>

        {/* Main Table Card */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #e5e5e5",
            borderTop: `4px solid ${TVK_RED}`,
            boxShadow: "0 4px 24px -8px rgba(161,15,20,0.10)",
            overflow: "hidden",
          }}
        >
          {/* Filter Bar */}
          <div
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid #f0f0f0",
              background: "#fafafa",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "12px",
              }}
              className="admin-filter-grid"
            >
              <div style={{ position: "relative" }}>
                <Search
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 16,
                    height: 16,
                    color: "#9ca3af",
                    pointerEvents: "none",
                  }}
                />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("admin.search.ph")}
                  style={{ paddingLeft: "36px", borderRadius: "10px", fontSize: "13px" }}
                />
              </div>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "140px" }}>
                  <Label style={{ fontSize: "11px", color: "#888", display: "block", marginBottom: "5px" }}>
                    {t("admin.dateFrom")}
                  </Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    style={{ borderRadius: "10px", fontSize: "13px" }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: "140px" }}>
                  <Label style={{ fontSize: "11px", color: "#888", display: "block", marginBottom: "5px" }}>
                    {t("admin.dateTo")}
                  </Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    style={{ borderRadius: "10px", fontSize: "13px" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }} className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow style={{ background: "linear-gradient(135deg, #fdeaea, #fff9e6)" }}>
                  <TableHead style={{ fontSize: "11px", fontWeight: 700, color: TVK_RED, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {t("admin.col.id")}
                  </TableHead>
                  <TableHead style={{ fontSize: "11px", fontWeight: 700, color: TVK_RED, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {t("admin.col.name")}
                  </TableHead>
                  <TableHead style={{ fontSize: "11px", fontWeight: 700, color: TVK_RED, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {t("admin.col.phone")}
                  </TableHead>
                  <TableHead className="hidden md:table-cell" style={{ fontSize: "11px", fontWeight: 700, color: TVK_RED, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {t("admin.col.email")}
                  </TableHead>
                  <TableHead className="hidden lg:table-cell" style={{ fontSize: "11px", fontWeight: 700, color: TVK_RED, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {t("admin.col.constituency")}
                  </TableHead>
                  <TableHead className="hidden md:table-cell" style={{ fontSize: "11px", fontWeight: 700, color: TVK_RED, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {t("admin.col.village")}
                  </TableHead>
                  <TableHead style={{ fontSize: "11px", fontWeight: 700, color: TVK_RED, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {t("admin.col.ward")}
                  </TableHead>
                  <TableHead style={{ fontSize: "11px", fontWeight: 700, color: TVK_RED, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {t("admin.col.pincode")}
                  </TableHead>
                  <TableHead style={{ fontSize: "11px", fontWeight: 700, color: TVK_RED, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {t("admin.col.pdf")}
                  </TableHead>
                  <TableHead style={{ fontSize: "11px", fontWeight: 700, color: TVK_RED, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {t("admin.col.submitted")}
                  </TableHead>
                  <TableHead style={{ fontSize: "11px", fontWeight: 700, color: TVK_RED, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {t("admin.col.status")}
                  </TableHead>
                  <TableHead className="hidden xl:table-cell" style={{ fontSize: "11px", fontWeight: 700, color: TVK_RED, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {t("admin.col.pendingReason")}
                  </TableHead>
                  <TableHead className="hidden lg:table-cell" style={{ fontSize: "11px", fontWeight: 700, color: TVK_RED, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {t("admin.col.lastUpdated")}
                  </TableHead>
                  <TableHead className="text-right" style={{ fontSize: "11px", fontWeight: 700, color: TVK_RED, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {t("admin.col.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={14} className="py-12 text-center">
                      <Loader2
                        style={{ margin: "0 auto", width: 24, height: 24, color: TVK_RED, animation: "spin 1s linear infinite" }}
                      />
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
                    <TableRow
                      key={c.id}
                      style={{ transition: "background 0.15s" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#fff8f8")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "")}
                    >
                      <TableCell className="font-mono text-xs" style={{ color: TVK_RED, fontWeight: 600 }}>
                        {c.complaint_no}
                      </TableCell>
                      <TableCell className="font-medium" style={{ fontSize: "13px" }}>{c.full_name}</TableCell>
                      <TableCell style={{ fontSize: "13px" }}>{c.phone}</TableCell>
                      <TableCell className="hidden md:table-cell" style={{ fontSize: "12px", color: "#666" }}>{c.email ?? "—"}</TableCell>
                      <TableCell className="hidden lg:table-cell" style={{ fontSize: "12px" }}>{c.assembly_constituency}</TableCell>
                      <TableCell className="hidden md:table-cell text-xs" style={{ color: "#666" }}>{c.village || "—"}</TableCell>
                      <TableCell style={{ fontSize: "13px" }}>{c.ward_number}</TableCell>
                      <TableCell style={{ fontSize: "13px" }}>{c.pincode}</TableCell>
                      <TableCell>
                        <button
                          onClick={() => downloadPdf(c)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            border: `1px solid ${TVK_RED}`,
                            background: "#fdeaea",
                            color: TVK_RED,
                            cursor: "pointer",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background = TVK_RED;
                            (e.currentTarget as HTMLElement).style.color = "#fff";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background = "#fdeaea";
                            (e.currentTarget as HTMLElement).style.color = TVK_RED;
                          }}
                        >
                          <Download style={{ width: 13, height: 13 }} />
                        </button>
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap" style={{ color: "#666" }}>
                        {new Date(c.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={c.status} />
                      </TableCell>
                      <TableCell className="hidden xl:table-cell text-xs max-w-[140px] truncate" style={{ color: "#666" }}>
                        {c.pending_reason || "—"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs whitespace-nowrap" style={{ color: "#666" }}>
                        {c.last_updated ? new Date(c.last_updated).toLocaleString() : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "4px" }}>
                          <button
                            onClick={() => openEditDialog(c)}
                            title={t("admin.edit")}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "30px",
                              height: "30px",
                              borderRadius: "8px",
                              border: `1px solid ${TVK_GOLD}`,
                              background: "#fffbeb",
                              color: "#d97706",
                              cursor: "pointer",
                              transition: "background 0.15s",
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLElement).style.background = TVK_GOLD;
                              (e.currentTarget as HTMLElement).style.color = "#1a1a1a";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLElement).style.background = "#fffbeb";
                              (e.currentTarget as HTMLElement).style.color = "#d97706";
                            }}
                          >
                            <Pencil style={{ width: 12, height: 12 }} />
                          </button>
                          <button
                            onClick={() => setToDelete(c)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "30px",
                              height: "30px",
                              borderRadius: "8px",
                              border: "1px solid #fecaca",
                              background: "#fff5f5",
                              color: "#dc2626",
                              cursor: "pointer",
                              transition: "background 0.15s",
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLElement).style.background = "#dc2626";
                              (e.currentTarget as HTMLElement).style.color = "#fff";
                              (e.currentTarget as HTMLElement).style.borderColor = "#dc2626";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLElement).style.background = "#fff5f5";
                              (e.currentTarget as HTMLElement).style.color = "#dc2626";
                              (e.currentTarget as HTMLElement).style.borderColor = "#fecaca";
                            }}
                          >
                            <Trash2 style={{ width: 13, height: 13 }} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card List (visible on mobile, hidden on tablet/desktop) */}
          <div className="block md:hidden p-4 space-y-4 bg-gray-50/50">
            {loading ? (
              <div className="py-12 text-center">
                <Loader2
                  style={{ margin: "0 auto", width: 24, height: 24, color: TVK_RED, animation: "spin 1s linear infinite" }}
                />
              </div>
            ) : pageRows.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                {t("admin.empty")}
              </div>
            ) : (
              pageRows.map((c) => (
                <AdminComplaintCard
                  key={c.id}
                  complaint={c}
                  downloadPdf={downloadPdf}
                  onDelete={setToDelete}
                  onUpdate={handleComplaintUpdate}
                  t={t}
                />
              ))
            )}
          </div>

          {/* Pagination */}
          {filtered.length > 0 && (
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid #f0f0f0",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                background: "#fafafa",
              }}
            >
              <p style={{ fontSize: "12px", color: "#888", margin: 0 }}>
                {t("admin.page", { current: currentPage, total: totalPages, n: filtered.length })}
              </p>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  style={{
                    padding: "7px 14px",
                    borderRadius: "8px",
                    border: "1px solid #e5e5e5",
                    background: currentPage <= 1 ? "#f5f5f5" : "#fff",
                    color: currentPage <= 1 ? "#aaa" : "#333",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: currentPage <= 1 ? "not-allowed" : "pointer",
                  }}
                  className="mobile-btn-inline"
                >
                  {t("admin.prev")}
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  style={{
                    padding: "7px 14px",
                    borderRadius: "8px",
                    border: `1px solid ${TVK_RED}`,
                    background: currentPage >= totalPages ? "#f5f5f5" : TVK_RED,
                    color: currentPage >= totalPages ? "#aaa" : "#fff",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
                  }}
                  className="mobile-btn-inline"
                >
                  {t("admin.next")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <TVKFooter />

      {/* Edit Status Dialog */}
      <AlertDialog open={!!editingComplaint} onOpenChange={(o) => !o && setEditingComplaint(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: TVK_RED }}>{t("admin.editStatus.title")}</AlertDialogTitle>
            <AlertDialogDescription>{editingComplaint?.complaint_no}</AlertDialogDescription>
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
              style={{
                background: `linear-gradient(135deg, ${TVK_RED}, ${TVK_RED_DARK})`,
                color: "#fff",
              }}
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

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 640px) {
          .admin-signout-text { display: inline !important; }
          .admin-filter-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (min-width: 1024px) {
          .admin-filter-grid { grid-template-columns: 2fr 1fr !important; }
        }
      `}</style>
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, React.CSSProperties> = {
    Pending: {
      background: "#fffbeb",
      color: "#92400e",
      border: "1px solid #fde68a",
    },
    Resolved: {
      background: "#f0fdf4",
      color: "#15803d",
      border: "1px solid #86efac",
    },
  };
  const style = styles[status] ?? {
    background: "#f5f5f5",
    color: "#333",
    border: "1px solid #e5e5e5",
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: "999px",
        fontSize: "11px",
        fontWeight: 700,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {status}
    </span>
  );
}

function AdminStatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "14px",
        border: "1px solid #e5e5e5",
        borderTop: `4px solid ${color}`,
        padding: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        transition: "box-shadow 0.2s, transform 0.2s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.10)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
      }}
    >
      <div>
        <p style={{ fontSize: "12px", color: "#888", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
          {label}
        </p>
        <p style={{ fontSize: "32px", fontWeight: 800, color: "#1a1a1a", margin: 0, lineHeight: 1 }}>
          {value}
        </p>
      </div>
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          background: `${color}18`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `1px solid ${color}30`,
        }}
      >
        {icon}
      </div>
    </div>
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

function AdminComplaintCard({
  complaint,
  downloadPdf,
  onDelete,
  onUpdate,
  t,
}: {
  complaint: Complaint;
  downloadPdf: (c: Complaint) => void;
  onDelete: (c: Complaint) => void;
  onUpdate: (updated: Complaint) => void;
  t: any;
}) {
  const [status, setStatus] = useState(complaint.status || "Pending");
  const [pendingReason, setPendingReason] = useState(complaint.pending_reason || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setStatus(complaint.status || "Pending");
    setPendingReason(complaint.pending_reason || "");
  }, [complaint]);

  const hasChanges = status !== complaint.status || (status === "Pending" && pendingReason !== complaint.pending_reason);

  async function handleSave() {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      toast.error(t("admin.requireAdmin"));
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/complaints/${complaint.id}/status`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          pendingReason: status === "Pending" ? pendingReason : "",
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to update status.");
      }

      const data = await response.json();
      onUpdate(data.complaint);
      toast.success(t("admin.updated"));
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update status.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-mobile-card">
      {/* Header Row: ID and Download PDF */}
      <div className="flex items-center justify-between border-b pb-3 mb-3">
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">ID</span>
          <span className="font-mono text-sm font-bold text-red-700">{complaint.complaint_no}</span>
        </div>
        <button
          onClick={() => downloadPdf(complaint)}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors"
          style={{ minHeight: "36px" }}
        >
          <Download style={{ width: 14, height: 14 }} />
          Download PDF
        </button>
      </div>

      {/* Grid of basic info */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center text-xs py-1 border-b border-gray-50">
          <span className="font-bold text-gray-400 uppercase">Customer Name</span>
          <span className="font-semibold text-gray-800">{complaint.full_name}</span>
        </div>
        <div className="flex justify-between items-center text-xs py-1 border-b border-gray-50">
          <span className="font-bold text-gray-400 uppercase">Phone</span>
          <a href={`tel:${complaint.phone}`} className="font-bold text-red-700 hover:underline">{complaint.phone}</a>
        </div>
        <div className="flex justify-between items-center text-xs py-1 border-b border-gray-50">
          <span className="font-bold text-gray-400 uppercase">Village</span>
          <span className="font-semibold text-gray-800">{complaint.village || "—"}</span>
        </div>
        <div className="flex justify-between items-center text-xs py-1 border-b border-gray-50">
          <span className="font-bold text-gray-400 uppercase">Ward Number</span>
          <span className="font-semibold text-gray-800">{complaint.ward_number}</span>
        </div>
        <div className="flex justify-between items-center text-xs py-1 border-b border-gray-50">
          <span className="font-bold text-gray-400 uppercase">Last Updated</span>
          <span className="font-medium text-gray-600">
            {complaint.last_updated ? new Date(complaint.last_updated).toLocaleString() : "—"}
          </span>
        </div>
      </div>

      {/* Editing Controls */}
      <div className="space-y-3 pt-2 mb-4 border-t">
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Status</label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="mobile-input w-full select-trigger" style={{ borderColor: "#e5e5e5", borderRadius: "10px" }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Pending", "Resolved"].map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {status === "Pending" && (
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Reason for Pending</label>
            <textarea
              value={pendingReason}
              onChange={(e) => setPendingReason(e.target.value)}
              placeholder="Enter reason for pending status…"
              rows={2}
              className="flex w-full rounded-md border border-gray-200 bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
              style={{ fontSize: "16px" }}
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="mobile-btn text-white font-bold"
          style={{
            background: saving || !hasChanges
              ? "#d1d5db"
              : `linear-gradient(135deg, #A10F14, #7d0b0f)`,
            color: "#fff",
            cursor: saving || !hasChanges ? "not-allowed" : "pointer",
            boxShadow: saving || !hasChanges ? "none" : "0 3px 10px rgba(161,15,20,0.20)",
          }}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving Changes…
            </>
          ) : (
            "Save Changes"
          )}
        </button>

        <button
          onClick={() => onDelete(complaint)}
          className="mobile-btn font-bold"
          style={{
            background: "#fff5f5",
            border: "1px solid #fecaca",
            color: "#dc2626",
            cursor: "pointer",
          }}
        >
          Delete Complaint
        </button>
      </div>
    </div>
  );
}
