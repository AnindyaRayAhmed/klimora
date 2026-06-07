import { useState } from "react";
import { Crosshair, Plus, Minus, Layers, MapPin } from "lucide-react";
import { localities, type LocalityId } from "@/lib/ui-constants";

export type ClimateLayer = "heat" | "vegetation" | "rainfall" | "aqi" | "climate" | "community";

type Props = {
  layer: ClimateLayer;
  selectedId?: string;
  onLocationClick?: (id: string) => void;
  localitiesOverride?: any[];
};

const layerConfig: Record<ClimateLayer, { color: string; label: string }> = {
  heat: { color: "var(--heat)", label: "Heat" },
  vegetation: { color: "var(--vegetation)", label: "Vegetation (NDVI)" },
  rainfall: { color: "var(--rainfall)", label: "Rainfall" },
  aqi: { color: "var(--aqi)", label: "Air Quality" },
  climate: { color: "var(--climate)", label: "Climate Score" },
  community: { color: "var(--community)", label: "Community Impact" },
};

// Procedurally-generated intensity field (changes per layer via seed offset)
function buildCells(seedShift: number) {
  return Array.from({ length: 22 * 14 }, (_, i) => {
    const x = i % 22;
    const y = Math.floor(i / 22);
    const seed = Math.sin((x + seedShift) * 12.9898 + (y + seedShift) * 78.233) * 43758.5453;
    const intensity = seed - Math.floor(seed);
    return { x, y, intensity };
  });
}

const layerSeeds: Record<ClimateLayer, number> = {
  heat: 0,
  vegetation: 7,
  rainfall: 13,
  aqi: 21,
  climate: 30,
  community: 41,
};

const hotspotsByLayer: Record<ClimateLayer, { left: string; top: string; size: number; intensity: number }[]> = {
  heat: [
    { left: "32%", top: "38%", size: 260, intensity: 0.95 },
    { left: "72%", top: "70%", size: 220, intensity: 0.85 },
    { left: "48%", top: "22%", size: 140, intensity: 0.5 },
  ],
  vegetation: [
    { left: "26%", top: "60%", size: 240, intensity: 0.9 },
    { left: "84%", top: "30%", size: 170, intensity: 0.6 },
  ],
  rainfall: [
    { left: "18%", top: "70%", size: 200, intensity: 0.7 },
    { left: "60%", top: "30%", size: 180, intensity: 0.5 },
  ],
  aqi: [
    { left: "34%", top: "40%", size: 230, intensity: 0.85 },
    { left: "72%", top: "70%", size: 200, intensity: 0.75 },
  ],
  climate: [
    { left: "26%", top: "60%", size: 240, intensity: 0.9 },
    { left: "60%", top: "56%", size: 180, intensity: 0.6 },
  ],
  community: [
    { left: "34%", top: "40%", size: 220, intensity: 0.85 },
    { left: "60%", top: "56%", size: 180, intensity: 0.7 },
    { left: "84%", top: "30%", size: 160, intensity: 0.55 },
  ],
};

export function MapCanvas({ layer, selectedId, onLocationClick, localitiesOverride }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const color = layerConfig[layer].color;
  const cells = buildCells(layerSeeds[layer]);
  const hotspots = hotspotsByLayer[layer];

  return (
    <div className="relative h-full w-full overflow-hidden bg-[oklch(0.13_0.025_225)]">
      {/* Base map tiles — abstract topo grid */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.22]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="oklch(0.45 0.04 225)" strokeWidth="0.5" />
          </pattern>
          <pattern id="grid-major" width="240" height="240" patternUnits="userSpaceOnUse">
            <path d="M 240 0 L 0 0 0 240" fill="none" stroke="oklch(0.55 0.05 225)" strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <rect width="100%" height="100%" fill="url(#grid-major)" />
      </svg>

      {/* Topographic contours */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.18]" viewBox="0 0 1000 700" preserveAspectRatio="none">
        {[0, 60, 120, 180, 240, 300, 360, 420, 480, 540, 600].map((y) => (
          <path
            key={y}
            d={`M 0 ${y + 40} Q 200 ${y - 20} 400 ${y + 30} T 800 ${y + 10} T 1000 ${y + 50}`}
            stroke="oklch(0.6 0.07 220)"
            strokeWidth="0.7"
            fill="none"
          />
        ))}
      </svg>

      {/* Rivers / roads */}
      <svg className="absolute inset-0 h-full w-full opacity-50" viewBox="0 0 1000 700" preserveAspectRatio="none">
        <path d="M 0 380 Q 250 360 500 400 T 1000 380" stroke="oklch(0.6 0.12 230)" strokeWidth="3.5" fill="none" opacity="0.55" />
        <path d="M 200 0 L 350 700" stroke="oklch(0.45 0.02 225)" strokeWidth="2" fill="none" />
        <path d="M 800 0 L 650 700" stroke="oklch(0.45 0.02 225)" strokeWidth="2" fill="none" />
        <path d="M 0 200 L 1000 250" stroke="oklch(0.45 0.02 225)" strokeWidth="2" fill="none" />
      </svg>

      {/* Climate layer heatmap */}
      <div className="absolute inset-0 grid" style={{ gridTemplateColumns: "repeat(22, 1fr)", gridTemplateRows: "repeat(14, 1fr)" }}>
        {cells.map((c) => (
          <div
            key={`${c.x}-${c.y}`}
            style={{ background: color, opacity: c.intensity * 0.22 }}
          />
        ))}
      </div>

      {/* Glowing hotspots */}
      {hotspots.map((h, i) => (
        <div
          key={i}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
          style={{
            left: h.left,
            top: h.top,
            width: h.size,
            height: h.size,
            background: `radial-gradient(circle, ${color} 0%, transparent 65%)`,
            opacity: h.intensity * 0.55,
            filter: "blur(8px)",
          }}
        />
      ))}

      {/* Location pins */}
      {(localitiesOverride || localities).map((p: any) => {
        const active = selectedId === p.id;
        return (
          <button
            key={p.id}
            onClick={() => onLocationClick?.(p.id)}
            onMouseEnter={() => setHoveredId(p.id)}
            onMouseLeave={() => setHoveredId(null)}
            className="absolute -translate-x-1/2 -translate-y-full group"
            style={{ left: p.pin.left, top: p.pin.top }}
          >
            <div className="relative">
              {active && (
                <span
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full animate-pulse-ring"
                  style={{ background: "var(--primary)" }}
                />
              )}
              <MapPin
                className={`h-7 w-7 drop-shadow-[0_2px_8px_oklch(0.55_0.16_230/0.6)] transition-transform ${active ? "scale-110" : ""}`}
                style={{ color: active ? "var(--primary)" : "oklch(0.7 0.13 195)" }}
                fill={active ? "oklch(0.64 0.16 232 / 0.45)" : "oklch(0.72 0.14 195 / 0.25)"}
                strokeWidth={2.2}
              />
            </div>
            {(hoveredId === p.id || active) && (
              <div className="absolute left-1/2 -translate-x-1/2 -top-10 px-2.5 py-1 rounded-md glass-strong text-xs font-medium whitespace-nowrap">
                {p.name}
              </div>
            )}
          </button>
        );
      })}

      {/* Map controls */}
      <div className="absolute right-4 bottom-6 flex flex-col gap-2">
        <button className="h-9 w-9 rounded-lg glass-strong flex items-center justify-center hover:bg-primary/10 transition-colors" title="Zoom in">
          <Plus className="h-4 w-4" />
        </button>
        <button className="h-9 w-9 rounded-lg glass-strong flex items-center justify-center hover:bg-primary/10 transition-colors" title="Zoom out">
          <Minus className="h-4 w-4" />
        </button>
        <button className="h-9 w-9 rounded-lg glass-strong flex items-center justify-center hover:bg-primary/10 transition-colors" title="My location">
          <Crosshair className="h-4 w-4 text-primary" />
        </button>
        <button className="h-9 w-9 rounded-lg glass-strong flex items-center justify-center hover:bg-primary/10 transition-colors" title="Layers">
          <Layers className="h-4 w-4" />
        </button>
      </div>

      {/* Layer legend */}
      <div className="absolute left-4 bottom-6 glass-strong rounded-lg px-3 py-2.5 text-xs">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">{layerConfig[layer].label}</div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-32 rounded-full" style={{ background: `linear-gradient(to right, transparent, ${color})` }} />
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
          <span>Low</span><span>High</span>
        </div>
      </div>
    </div>
  );
}
