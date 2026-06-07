import { Database, Satellite, LineChart as LineChartIcon, Users } from "lucide-react";
const evidenceSources = [
  { id: "weather", label: "Weather Data", detail: "IMD station + ERA5 reanalysis" },
  { id: "satellite", label: "Satellite Observations", detail: "Sentinel-2 / MODIS NDVI" },
  { id: "history", label: "Historical Trends", detail: "6-year locality baseline" },
  { id: "community", label: "Community Reports", detail: "Verified resident submissions" },
] as const;

export type EvidenceSourceId = typeof evidenceSources[number]["id"];

const iconMap: Record<EvidenceSourceId, typeof Database> = {
  weather: Database,
  satellite: Satellite,
  history: LineChartIcon,
  community: Users,
};

export function EvidenceSources({
  sources = evidenceSources.map((s) => s.id),
  compact = false,
}: {
  sources?: EvidenceSourceId[];
  compact?: boolean;
}) {
  const items = evidenceSources.filter((s) => sources.includes(s.id));
  return (
    <div className={`glass rounded-xl ${compact ? "p-3" : "p-3.5"}`}>
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">Evidence Sources</div>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        {items.map((s) => {
          const Icon = iconMap[s.id];
          return (
            <li key={s.id} className="flex items-start gap-2 text-xs">
              <Icon className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
              <div className="min-w-0">
                <div className="font-medium leading-tight">{s.label}</div>
                {!compact && <div className="text-[10px] text-muted-foreground leading-tight truncate">{s.detail}</div>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
