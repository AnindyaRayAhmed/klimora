import { Link } from "@tanstack/react-router";
import { MapPin, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import type { Locality } from "@/lib/ui-constants";

export function LocalityInsights({ locality }: { locality: Locality }) {
  return (
    <div className="glass-strong rounded-2xl p-4 md:p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Locality Insights</div>
          <div className="font-semibold text-base mt-0.5 truncate">{locality.name}</div>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
            <MapPin className="h-3 w-3" /> {locality.boundary}
          </div>
        </div>
        <div className="text-right text-[10px] text-muted-foreground tabular-nums shrink-0">
          {locality.coordinates.lat.toFixed(4)}°N
          <br />
          {locality.coordinates.lng.toFixed(4)}°E
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-2 py-3 border-y border-border/40 text-xs">
        <Row label="Temperature" value={`${locality.temperature.value}°C`} />
        <Row label="AQI" value={`${locality.airQuality.aqi}`} sub={locality.airQuality.label} />
        <Row label="Vegetation Index" value={locality.vegetation.ndvi.toFixed(2)} sub={locality.vegetation.label} />
        <Row label="Rainfall" value={`${locality.rainfall.mm} mm`} sub={locality.rainfall.label} />
      </div>

      <div className="mt-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Recommended Actions</div>
        <ul className="space-y-1.5">
          {locality.recommendedActions.map((a) => (
            <li key={a} className="flex items-start gap-2 text-xs">
              <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-secondary shrink-0" />
              <span className="text-foreground/90">{a}</span>
            </li>
          ))}
        </ul>
      </div>

      <Link
        to="/rit"
        search={{ locality: locality.id }}
        className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-primary-foreground hover:opacity-95 transition-opacity"
        style={{ background: "var(--gradient-data)" }}
      >
        <Sparkles className="h-4 w-4" />
        Ask Rit about {locality.name}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function Row({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-semibold text-sm tabular-nums leading-tight">{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground leading-tight">{sub}</div>}
    </div>
  );
}
