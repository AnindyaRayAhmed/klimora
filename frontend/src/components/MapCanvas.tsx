import { useState, useRef, useEffect } from "react";
import { Crosshair, Plus, Minus, Layers, MapPin } from "lucide-react";
import { localities, type LocalityId } from "@/lib/ui-constants";

import { useAppStore } from "@/store";

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
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const { detectedCoordinates } = useAppStore();
  const [mapReady, setMapReady] = useState(false);

  const config = layerConfig[layer] || layerConfig["climate"];
  const color = config.color;
  const cells = buildCells(layerSeeds[layer] ?? layerSeeds["climate"]);
  const hotspots = hotspotsByLayer[layer] || hotspotsByLayer["climate"];

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn("VITE_GOOGLE_MAPS_API_KEY is missing. Basemap will not load.");
      return;
    }

    const initMap = () => {
      if (!mapRef.current || !(window as any).google) return;
      mapInstanceRef.current = new (window as any).google.maps.Map(mapRef.current, {
        center: { lat: 20.5937, lng: 78.9629 }, // India center
        zoom: 4.5,
        disableDefaultUI: true,
        backgroundColor: '#0a1f1c', // Klimora dark background
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#101c1a' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#101c1a' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#4d685f' }] },
          { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#688c80' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0b1615' }] },
          { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#31443f' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#162b27' }] },
          { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#101c1a' }] },
        ]
      });

      (window as any).google.maps.event.addListenerOnce(mapInstanceRef.current, 'tilesloaded', () => {
        console.log('[Map Debug] mapReady');
        setMapReady(true);
      });
    };

    if ((window as any).google?.maps) {
      initMap();
    } else {
      if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = initMap;
        document.head.appendChild(script);
      } else {
        const check = setInterval(() => {
          if ((window as any).google?.maps) {
            clearInterval(check);
            initMap();
          }
        }, 100);
      }
    }
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && selectedId && mapReady) {
      if (selectedId === "dynamic" && detectedCoordinates) {
        console.log(`[Map Debug] coordinates changed:`, detectedCoordinates);
        console.log(`[Map Debug] panTo executing`);
        mapInstanceRef.current.panTo(detectedCoordinates);
        console.log(`[Map Debug] setZoom executing`);
        mapInstanceRef.current.setZoom(15);
      } else {
        const locList = localitiesOverride || localities;
        const targetLoc = locList.find((l: any) => l.id === selectedId);
        if (targetLoc?.coordinates) {
          console.log(`[MapCanvas] Recentering map to ${targetLoc.id} at`, targetLoc.coordinates);
          mapInstanceRef.current.panTo(targetLoc.coordinates);
        }
      }
    }
  }, [selectedId, localitiesOverride, detectedCoordinates, mapReady]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[oklch(0.13_0.025_225)]">
      {/* Real Google Maps Basemap */}
      <div ref={mapRef} className={`absolute inset-0 h-full w-full z-0 transition-opacity ${selectedId === "dynamic" ? "opacity-100" : "opacity-30 mix-blend-luminosity"}`} />
      
      {/* Static Demo Overlays */}
      {selectedId !== "dynamic" && (
        <>
          {/* Base map tiles — abstract topo grid */}
          <svg className="absolute inset-0 h-full w-full opacity-[0.22] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
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
      </>
      )}

      {/* Location pins */}
      {selectedId !== "dynamic" && (localitiesOverride || localities).map((p: any) => {
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

      {/* Dynamic Mode: You Are Here Marker */}
      {selectedId === "dynamic" && detectedCoordinates && (
        <div 
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none group z-10"
          style={{ 
            left: "50%", 
            top: "50%" // Centered because map pans to it
          }}
        >
          <div className="relative flex items-center justify-center">
            <span
              className="absolute h-8 w-8 rounded-full animate-ping"
              style={{ background: "var(--primary)", opacity: 0.2 }}
            />
            <div className="h-4 w-4 rounded-full border-2 border-white drop-shadow-md" style={{ background: "var(--primary)" }} />
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 -top-8 px-2.5 py-1 rounded-md glass-strong text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            You are here
          </div>
        </div>
      )}

      {/* Map controls */}
      <div className="absolute right-4 bottom-6 flex flex-col gap-2">
        <button 
          onClick={() => {
            if (mapInstanceRef.current) {
              const currentZoom = mapInstanceRef.current.getZoom();
              mapInstanceRef.current.setZoom(currentZoom + 1);
            }
          }}
          className="h-9 w-9 rounded-lg glass-strong flex items-center justify-center hover:bg-primary/10 transition-colors" 
          title="Zoom in"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button 
          onClick={() => {
            if (mapInstanceRef.current) {
              const currentZoom = mapInstanceRef.current.getZoom();
              mapInstanceRef.current.setZoom(currentZoom - 1);
            }
          }}
          className="h-9 w-9 rounded-lg glass-strong flex items-center justify-center hover:bg-primary/10 transition-colors" 
          title="Zoom out"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button 
          onClick={() => {
            if (mapInstanceRef.current) {
              if (selectedId === "dynamic" && detectedCoordinates) {
                mapInstanceRef.current.setCenter(detectedCoordinates);
                mapInstanceRef.current.setZoom(15);
              } else {
                const locList = localitiesOverride || localities;
                const targetLoc = locList.find((l: any) => l.id === selectedId);
                if (targetLoc?.coordinates) {
                  mapInstanceRef.current.setCenter(targetLoc.coordinates);
                  mapInstanceRef.current.setZoom(13.5);
                } else {
                  mapInstanceRef.current.setCenter({ lat: 20.5937, lng: 78.9629 });
                  mapInstanceRef.current.setZoom(4.5);
                }
              }
            }
          }}
          className="h-9 w-9 rounded-lg glass-strong flex items-center justify-center hover:bg-primary/10 transition-colors" 
          title="My location"
        >
          <Crosshair className="h-4 w-4 text-primary" />
        </button>
        <button className="h-9 w-9 rounded-lg glass-strong flex items-center justify-center hover:bg-primary/10 transition-colors" title="Layers">
          <Layers className="h-4 w-4" />
        </button>
      </div>

      {/* Layer legend */}
      <div className="absolute left-4 bottom-6 glass-strong rounded-lg px-3 py-2.5 text-xs">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">{config.label}</div>
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
