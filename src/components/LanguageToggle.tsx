import { Languages } from "lucide-react";
import { useI18n, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang, t } = useI18n();

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-background/80 p-1 shadow-sm backdrop-blur",
        className,
      )}
      role="group"
      aria-label={t("lang.label")}
    >
      <Languages className="ml-1.5 h-3.5 w-3.5 text-muted-foreground" aria-hidden />
      {(["en", "ta"] as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
            lang === l
              ? "bg-gradient-brand text-brand-foreground shadow-soft"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t(`lang.${l}`)}
        </button>
      ))}
    </div>
  );
}
