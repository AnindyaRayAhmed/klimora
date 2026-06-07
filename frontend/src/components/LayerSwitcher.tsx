import { Flame, Trees, CloudRain, Wind, Activity, Users } from "lucide-react";
import type { ClimateLayer } from "./MapCanvas";

const layers: { id: ClimateLayer; label: string; icon: typeof Flame; token: string }[] = [
  { id: "heat", label: "Heat", icon: Flame, token: "heat" },
  { id: "vegetation", label: "Vegetation", icon: Trees, token: "vegetation" },
  { id: "aqi", label: "AQI", icon: Wind, token: "aqi" },
  { id: "rainfall", label: "Rainfall", icon: CloudRain, token: "rainfall" },
  { id: "climate", label: "Climate Score", icon: Activity, token: "climate" },
  { id: "community", label: "Community Impact", icon: Users, token: "community" },
];

export function LayerSwitcher({
  value,
  onChange,
}: {
  value: ClimateLayer;
  onChange: (v: ClimateLayer) => void;
}) {
  return (
    <div className="inline-flex glass-strong rounded-xl p-1 gap-0.5 overflow-x-auto max-w-full">
      {layers.map(({ id, label, icon: Icon, token }) => {
        const active = value === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
            style={active ? { background: `color-mix(in oklab, var(--${token}) 20%, transparent)` } : undefined}
          >
            <Icon className="h-3.5 w-3.5" style={active ? { color: `var(--${token})` } : undefined} />
            <span className="hidden md:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
