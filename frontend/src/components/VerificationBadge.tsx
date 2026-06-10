import { CheckCircle2, Clock, Eye, XCircle, ShieldCheck, Users } from "lucide-react";

export type VerificationStatus = "pending" | "verified" | "manual" | "rejected";

const config: Record<VerificationStatus, { label: string; icon: typeof CheckCircle2; token: string; emoji: string }> = {
  pending:  { label: "Pending AI Review",  icon: Clock,        token: "warning",     emoji: "🟡" },
  verified: { label: "Verified",            icon: CheckCircle2, token: "success",     emoji: "✅" },
  manual:   { label: "Needs Manual Review", icon: Eye,          token: "rainfall",    emoji: "🔵" },
  rejected: { label: "Rejected",            icon: XCircle,      token: "destructive", emoji: "🔴" },
};

export function VerificationBadge({
  status,
  size = "sm",
  showIcon = true,
}: {
  status: VerificationStatus;
  size?: "xs" | "sm";
  showIcon?: boolean;
}) {
  const c = config[status] || config.pending;
  const Icon = c.icon;
  const padding = size === "xs" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-[11px]";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${padding}`}
      style={{
        background: `color-mix(in oklab, var(--${c.token}) 15%, transparent)`,
        color: `var(--${c.token})`,
        border: `1px solid color-mix(in oklab, var(--${c.token}) 30%, transparent)`,
      }}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {c.label}
    </span>
  );
}

export type VerifiedBy = "ai" | "community" | "manual";

const verifiedByConfig: Record<VerifiedBy, { label: string; icon: typeof ShieldCheck }> = {
  ai:        { label: "Verified by Klimora AI", icon: ShieldCheck },
  community: { label: "Community Verified",      icon: Users },
  manual:    { label: "Manual Review",           icon: Eye },
};

export function VerifiedByChip({ by }: { by: VerifiedBy }) {
  const c = verifiedByConfig[by] || verifiedByConfig.manual;
  const Icon = c.icon;
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium glass text-muted-foreground">
      <Icon className="h-3 w-3 text-primary" />
      {c.label}
    </span>
  );
}
