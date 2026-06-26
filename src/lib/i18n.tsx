import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "ta";

type Dict = Record<string, string>;

const en: Dict = {
  "brand.short": "129 - ATHOOR",
  "brand.tagline": "Complaint Portal",
  "nav.admin": "Admin",
  "nav.checkStatus": "Check Complaint Status",
  "lang.label": "Language",
  "lang.en": "English",
  "lang.ta": "தமிழ்",

  "home.badge": "Official Public Portal",
  "home.title": "129 - ATHOOR Complaint Submission Portal",
  "home.desc": "Please submit your complaint by filling out the form below. Upload your complaint only in PDF format.",
  "form.fullName": "Full Name",
  "form.fullName.ph": "Enter your full name",
  "form.phone": "Phone Number",
  "form.phone.ph": "10-digit mobile number",
  "form.email": "Email Address",
  "form.email.ph": "you@example.com",
  "form.optional": "Optional",
  "form.constituency": "Assembly Constituency",
  "form.village": "Village",
  "form.village.ph": "Select your village",
  "form.ward": "Ward Number",
  "form.ward.ph": "e.g. 12",
  "form.pincode": "Pincode",
  "form.pincode.ph": "6-digit PIN",
  "form.uploadLabel": "Upload Complaint PDF",
  "form.uploadCta": "Click to upload your complaint PDF",
  "form.uploadHint": "PDF only · Max 10 MB",
  "form.uploadReplace": "Click to replace",
  "form.submit": "Submit Complaint",
  "form.submitting": "Submitting…",
  "form.required": "Required",
  "err.fullName": "Full name is required",
  "err.phone": "Enter a valid 10-digit mobile number",
  "err.email": "Enter a valid email",
  "err.ward": "Ward number must be a positive integer",
  "err.pincode": "Enter a valid 6-digit Indian PIN code",
  "err.village": "Please select your village",
  "err.pdfType": "Only PDF files are accepted.",
  "err.pdfSize": "File too large. Maximum size is 10 MB.",
  "err.pdfMissing": "Please attach your complaint PDF.",
  "err.submit": "Could not submit your complaint. Please try again.",
  "toast.success": "Your complaint has been submitted successfully. Thank you.",
  "success.title": "Complaint submitted",
  "success.desc": "Your complaint has been submitted successfully. Thank you.",
  "success.id": "Complaint ID",
  "success.again": "Submit another complaint",
  "footer.copy": "© {year} 129 - ATHOOR Constituency Office",

  "auth.title": "Admin Access",
  "auth.subtitle": "Sign in to view and manage complaints.",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.signIn": "Sign In",
  "auth.signingIn": "Signing in…",
  "auth.backHome": "Back to portal",
  "auth.invalid": "Invalid email or password",

  "admin.title": "Admin Dashboard",
  "admin.signOut": "Sign out",
  "admin.stat.total": "Total complaints",
  "admin.stat.today": "Today",
  "admin.stat.filtered": "Filtered",
  "admin.search.ph": "Search by name, phone, ward, or complaint ID",
  "admin.dateFrom": "From date",
  "admin.dateTo": "To date",
  "admin.col.id": "Complaint ID",
  "admin.col.name": "Name",
  "admin.col.phone": "Phone",
  "admin.col.email": "Email",
  "admin.col.constituency": "Constituency",
  "admin.col.ward": "Ward",
  "admin.col.pincode": "Pincode",
  "admin.col.pdf": "PDF",
  "admin.col.submitted": "Submitted",
  "admin.col.actions": "Actions",
  "admin.loading": "Loading…",
  "admin.empty": "No complaints found.",
  "admin.page": "Page {current} of {total} · {n} complaint(s)",
  "admin.prev": "Previous",
  "admin.next": "Next",
  "admin.delete.title": "Delete this complaint?",
  "admin.delete.desc": "Complaint {id} and its PDF will be permanently removed. This cannot be undone.",
  "admin.delete.cancel": "Cancel",
  "admin.delete.confirm": "Delete",
  "admin.deleted": "Complaint deleted",
  "admin.dlError": "Could not generate download link",
  "admin.requireAdmin": "Admin access required",

  "admin.col.village": "Village",
  "admin.col.status": "Status",
  "admin.col.pendingReason": "Pending Reason",
  "admin.col.lastUpdated": "Last Updated",
  "admin.edit": "Edit",
  "admin.editStatus.title": "Update Complaint Status",
  "admin.editStatus.save": "Save Changes",
  "admin.editStatus.cancel": "Cancel",
  "admin.editStatus.status": "Status",
  "admin.editStatus.pendingReason": "Pending Reason",
  "admin.editStatus.pendingReason.ph": "e.g. Waiting for field verification",
  "admin.updated": "Complaint status updated",

  "status.title": "Check Complaint Status",
  "status.desc": "Enter your Complaint ID to check the current status of your complaint.",
  "status.badge": "Status Tracker",
  "status.complaintId": "Complaint ID",
  "status.complaintId.ph": "e.g. ATH-2024-001",
  "status.check": "Check Status",
  "status.checking": "Checking…",
  "status.notFound": "No complaint found with this Complaint ID.",
  "status.err.required": "Please enter a Complaint ID.",
  "status.card.id": "Complaint ID",
  "status.card.name": "Customer Name",
  "status.card.village": "Village",
  "status.card.constituency": "Assembly Constituency",
  "status.card.ward": "Ward Number",
  "status.card.submitted": "Submitted Date",
  "status.card.status": "Current Status",
  "status.card.pendingReason": "Reason for Pending",
  "status.card.lastUpdated": "Last Updated",
  "status.backHome": "Back to Portal",
};

const ta: Dict = {
  "brand.short": "129 - அத்தூர்",
  "brand.tagline": "புகார் தளம்",
  "nav.admin": "நிர்வாகி",
  "nav.checkStatus": "புகார் நிலையை சரிபார்க்கவும்",
  "lang.label": "மொழி",
  "lang.en": "English",
  "lang.ta": "தமிழ்",

  "home.badge": "அதிகாரப்பூர்வ பொது தளம்",
  "home.title": "129 - அத்தூர் புகார் சமர்ப்பிப்பு தளம்",
  "home.desc": "கீழே உள்ள படிவத்தை நிரப்பி உங்கள் புகாரைச் சமர்ப்பிக்கவும். உங்கள் புகாரை PDF வடிவில் மட்டுமே பதிவேற்றவும்.",
  "form.fullName": "முழுப் பெயர்",
  "form.fullName.ph": "உங்கள் முழுப் பெயரை உள்ளிடவும்",
  "form.phone": "தொலைபேசி எண்",
  "form.phone.ph": "10 இலக்க கைபேசி எண்",
  "form.email": "மின்னஞ்சல் முகவரி",
  "form.email.ph": "you@example.com",
  "form.optional": "விருப்பத்தேர்வு",
  "form.constituency": "சட்டமன்றத் தொகுதி",
  "form.village": "கிராமம்",
  "form.village.ph": "உங்கள் கிராமத்தைத் தேர்ந்தெடுக்கவும்",
  "form.ward": "வார்டு எண்",
  "form.ward.ph": "உதா. 12",
  "form.pincode": "அஞ்சல் குறியீடு",
  "form.pincode.ph": "6 இலக்க PIN",
  "form.uploadLabel": "புகார் PDF-ஐ பதிவேற்றவும்",
  "form.uploadCta": "உங்கள் புகார் PDF-ஐ பதிவேற்ற கிளிக் செய்யவும்",
  "form.uploadHint": "PDF மட்டும் · அதிகபட்சம் 10 MB",
  "form.uploadReplace": "மாற்ற கிளிக் செய்யவும்",
  "form.submit": "புகாரைச் சமர்ப்பிக்கவும்",
  "form.submitting": "சமர்ப்பிக்கிறது…",
  "form.required": "தேவை",
  "err.fullName": "முழுப் பெயர் தேவை",
  "err.phone": "சரியான 10 இலக்க கைபேசி எண்ணை உள்ளிடவும்",
  "err.email": "சரியான மின்னஞ்சலை உள்ளிடவும்",
  "err.ward": "வார்டு எண் நேர்மறை முழு எண்ணாக இருக்க வேண்டும்",
  "err.pincode": "சரியான 6 இலக்க PIN குறியீட்டை உள்ளிடவும்",
  "err.village": "உங்கள் கிராமத்தைத் தேர்ந்தெடுக்கவும்",
  "err.pdfType": "PDF கோப்புகள் மட்டுமே ஏற்கப்படும்.",
  "err.pdfSize": "கோப்பு மிகப் பெரியது. அதிகபட்ச அளவு 10 MB.",
  "err.pdfMissing": "உங்கள் புகார் PDF-ஐ இணைக்கவும்.",
  "err.submit": "உங்கள் புகாரை சமர்ப்பிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
  "toast.success": "உங்கள் புகார் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது. நன்றி.",
  "success.title": "புகார் சமர்ப்பிக்கப்பட்டது",
  "success.desc": "உங்கள் புகார் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது. நன்றி.",
  "success.id": "புகார் ஐடி",
  "success.again": "மற்றொரு புகாரைச் சமர்ப்பிக்கவும்",
  "footer.copy": "© {year} 129 - அத்தூர் தொகுதி அலுவலகம்",

  "auth.title": "நிர்வாகி அணுகல்",
  "auth.subtitle": "புகார்களைப் பார்க்க உள்நுழையவும்.",
  "auth.email": "மின்னஞ்சல்",
  "auth.password": "கடவுச்சொல்",
  "auth.signIn": "உள்நுழைய",
  "auth.signingIn": "உள்நுழைகிறது…",
  "auth.backHome": "தளத்திற்குத் திரும்ப",
  "auth.invalid": "தவறான மின்னஞ்சல் அல்லது கடவுச்சொல்",

  "admin.title": "நிர்வாக டாஷ்போர்டு",
  "admin.signOut": "வெளியேறு",
  "admin.stat.total": "மொத்த புகார்கள்",
  "admin.stat.today": "இன்று",
  "admin.stat.filtered": "வடிகட்டப்பட்டவை",
  "admin.search.ph": "பெயர், தொலைபேசி, வார்டு அல்லது புகார் ஐடி மூலம் தேடுக",
  "admin.dateFrom": "தொடக்க தேதி",
  "admin.dateTo": "முடிவு தேதி",
  "admin.col.id": "புகார் ஐடி",
  "admin.col.name": "பெயர்",
  "admin.col.phone": "தொலைபேசி",
  "admin.col.email": "மின்னஞ்சல்",
  "admin.col.constituency": "தொகுதி",
  "admin.col.ward": "வார்டு",
  "admin.col.pincode": "PIN",
  "admin.col.pdf": "PDF",
  "admin.col.submitted": "சமர்ப்பிக்கப்பட்டது",
  "admin.col.actions": "செயல்கள்",
  "admin.loading": "ஏற்றுகிறது…",
  "admin.empty": "புகார்கள் எதுவும் இல்லை.",
  "admin.page": "பக்கம் {current} / {total} · {n} புகார்(கள்)",
  "admin.prev": "முந்தைய",
  "admin.next": "அடுத்தது",
  "admin.delete.title": "இந்த புகாரை நீக்கவா?",
  "admin.delete.desc": "புகார் {id} மற்றும் அதன் PDF நிரந்தரமாக நீக்கப்படும். இதை மீட்க முடியாது.",
  "admin.delete.cancel": "ரத்துசெய்",
  "admin.delete.confirm": "நீக்கு",
  "admin.deleted": "புகார் நீக்கப்பட்டது",
  "admin.dlError": "பதிவிறக்க இணைப்பை உருவாக்க முடியவில்லை",
  "admin.requireAdmin": "நிர்வாக அணுகல் தேவை",

  "admin.col.village": "கிராமம்",
  "admin.col.status": "நிலை",
  "admin.col.pendingReason": "நிலுவை காரணம்",
  "admin.col.lastUpdated": "கடைசியாக புதுப்பிக்கப்பட்டது",
  "admin.edit": "திருத்து",
  "admin.editStatus.title": "புகார் நிலையை புதுப்பிக்கவும்",
  "admin.editStatus.save": "மாற்றங்களை சேமிக்கவும்",
  "admin.editStatus.cancel": "ரத்துசெய்",
  "admin.editStatus.status": "நிலை",
  "admin.editStatus.pendingReason": "நிலுவை காரணம்",
  "admin.editStatus.pendingReason.ph": "உதா. புல சரிபார்ப்புக்காக காத்திருக்கிறது",
  "admin.updated": "புகார் நிலை புதுப்பிக்கப்பட்டது",

  "status.title": "புகார் நிலையை சரிபார்க்கவும்",
  "status.desc": "உங்கள் புகாரின் தற்போதைய நிலையை சரிபார்க்க புகார் ஐடியை உள்ளிடவும்.",
  "status.badge": "நிலை கண்காணிப்பான்",
  "status.complaintId": "புகார் ஐடி",
  "status.complaintId.ph": "உதா. ATH-2024-001",
  "status.check": "நிலையை சரிபார்க்கவும்",
  "status.checking": "சரிபார்க்கிறது…",
  "status.notFound": "இந்த புகார் ஐடியுடன் புகார் எதுவும் இல்லை.",
  "status.err.required": "புகார் ஐடியை உள்ளிடவும்.",
  "status.card.id": "புகார் ஐடி",
  "status.card.name": "வாடிக்கையாளர் பெயர்",
  "status.card.village": "கிராமம்",
  "status.card.constituency": "சட்டமன்றத் தொகுதி",
  "status.card.ward": "வார்டு எண்",
  "status.card.submitted": "சமர்ப்பிக்கப்பட்ட தேதி",
  "status.card.status": "தற்போதைய நிலை",
  "status.card.pendingReason": "நிலுவைக்கான காரணம்",
  "status.card.lastUpdated": "கடைசியாக புதுப்பிக்கப்பட்டது",
  "status.backHome": "தளத்திற்குத் திரும்ப",
};

const dicts: Record<Lang, Dict> = { en, ta };

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const Ctx = createContext<I18nCtx | null>(null);
const STORAGE_KEY = "athoor.lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
      if (saved === "en" || saved === "ta") setLangState(saved);
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  function setLang(l: Lang) {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {}
  }

  function t(key: string, vars?: Record<string, string | number>) {
    const raw = dicts[lang][key] ?? dicts.en[key] ?? key;
    if (!vars) return raw;
    return raw.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
  }

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider");
  return ctx;
}
