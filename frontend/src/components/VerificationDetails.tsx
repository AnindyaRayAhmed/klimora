import { useState } from "react";
import { ChevronDown, Check, X, Sparkles } from "lucide-react";
import { VerificationBadge, type VerificationStatus } from "./VerificationBadge";

export type VerificationDetailsData = {
  status: VerificationStatus;
  confidence: number;            // 0–100
  detected: string[];
  metadata: { label: string; ok: boolean }[];
  resultText: string;
  notes?: string;
};

export function VerificationDetails({ data, defaultOpen = false }: { data: VerificationDetailsData; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const confidenceColor =
    data.confidence >= 80 ? "var(--success)" : data.confidence >= 60 ? "var(--warning)" : "var(--destructive)";

  return (
    <div className="rounded-xl border border-border/50 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full px-3 py-2 flex items-center justify-between hover:bg-primary/5 transition-colors"
      >
        <span className="flex items-center gap-2 text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Verification Details
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] tabular-nums font-semibold" style={{ color: confidenceColor }}>
            {data.confidence}%
          </span>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {open && (
        <div className="px-3 pb-3 pt-1 space-y-3 text-xs">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Detected</div>
            <ul className="space-y-1">
              {data.detected.map((d) => (
                <li key={d} className="flex items-center gap-1.5">
                  <Check className="h-3 w-3 text-success" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Verified Metadata</div>
            <ul className="space-y-1">
              {data.metadata.map((m) => (
                <li key={m.label} className="flex items-center gap-1.5">
                  {m.ok ? <Check className="h-3 w-3 text-success" /> : <X className="h-3 w-3 text-destructive" />}
                  <span className={m.ok ? "" : "text-muted-foreground line-through"}>{m.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Confidence</div>
              <div className="text-base font-bold tabular-nums" style={{ color: confidenceColor }}>{data.confidence}%</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Result</div>
              <div className="mt-0.5"><VerificationBadge status={data.status} /></div>
            </div>
          </div>

          <div className="text-[11px] text-foreground/80">{data.resultText}</div>
          {data.notes && <div className="text-[11px] text-muted-foreground italic">{data.notes}</div>}
        </div>
      )}
    </div>
  );
}
