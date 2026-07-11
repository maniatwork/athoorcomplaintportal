import { Languages } from "lucide-react";
import { useI18n, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const TVK_RED = "#A10F14";

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang, t } = useI18n();

  return (
    <div
      className={cn("inline-flex items-center gap-1 rounded-full p-1", className)}
      style={{
        border: "1px solid #e5e5e5",
        background: "#ffffff",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
      }}
      role="group"
      aria-label={t("lang.label")}
    >
      <Languages
        style={{ marginLeft: "6px", width: "14px", height: "14px", color: "#9ca3af", flexShrink: 0 }}
        aria-hidden
      />
      {(["en", "ta"] as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          style={{
            borderRadius: "999px",
            padding: "4px 12px",
            fontSize: "12px",
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
            transition: "background 0.15s, color 0.15s, box-shadow 0.15s",
            background:
              lang === l
                ? `linear-gradient(135deg, ${TVK_RED}, #7d0b0f)`
                : "transparent",
            color: lang === l ? "#ffffff" : "#6b7280",
            boxShadow:
              lang === l ? "0 2px 6px rgba(161,15,20,0.30)" : "none",
          }}
          onMouseEnter={(e) => {
            if (lang !== l) {
              (e.currentTarget as HTMLElement).style.color = TVK_RED;
            }
          }}
          onMouseLeave={(e) => {
            if (lang !== l) {
              (e.currentTarget as HTMLElement).style.color = "#6b7280";
            }
          }}
        >
          {t(`lang.${l}`)}
        </button>
      ))}
    </div>
  );
}
