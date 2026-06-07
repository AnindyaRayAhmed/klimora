import { X, ArrowUp, ArrowDown, Thermometer, Wind, Trees, CloudRain, ShieldAlert } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, Tooltip } from "recharts";
import { environmentalSummary, temperatureTrend, vegetationTrend, rainfallTrend } from "@/lib/ui-constants";

const riskColor: Record<string, string> = {
  Low: "var(--success)",
  Moderate: "var(--warning)",
  High: "var(--accent)",
  Severe: "var(--destructive)",
};

function Delta({ value, suffix = "" }: { value: number; suffix?: string }) {
  const positive = value > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${positive ? "text-accent" : "text-success"}`}>
      {positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {Math.abs(value)}{suffix}
    </span>
  );
}

function MetricCard({
  icon: Icon, label, value, unit, delta, token,
}: {
  icon: typeof Thermometer; label: string; value: string | number; unit?: string; delta: number; token: string;
}) {
  return (
    <div className="glass rounded-xl p-3.5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
          <Icon className="h-3.5 w-3.5" style={{ color: `var(--${token})` }} />
          {label}
        </div>
        <Delta value={delta} />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-semibold tracking-tight">{value}</span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
    </div>
  );
}

function TrendCard({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-xl p-3.5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground">{title}</span>
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      </div>
      <div className="h-20 -mx-1">{children}</div>
    </div>
  );
}

export function EnvironmentalPanel({ onClose }: { onClose: () => void }) {
  const s = environmentalSummary;
  return (
    <div className="h-full w-full overflow-y-auto glass-strong border-l border-border/60">
      <div className="sticky top-0 z-10 glass-strong px-5 py-4 border-b border-border/60 flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Selected location</div>
          <div className="font-semibold text-lg mt-0.5">{s.location}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {s.coordinates.lat.toFixed(4)}, {s.coordinates.lng.toFixed(4)}
          </div>
        </div>
        <button onClick={onClose} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-sidebar-accent text-muted-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* Risk banner */}
        <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: `color-mix(in oklab, ${riskColor[s.risk]} 16%, transparent)`, border: `1px solid color-mix(in oklab, ${riskColor[s.risk]} 35%, transparent)` }}>
          <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ background: `color-mix(in oklab, ${riskColor[s.risk]} 22%, transparent)` }}>
            <ShieldAlert className="h-5 w-5" style={{ color: riskColor[s.risk] }} />
          </div>
          <div className="flex-1">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Environmental Risk</div>
            <div className="font-semibold text-base" style={{ color: riskColor[s.risk] }}>{s.risk}</div>
          </div>
          <div className="text-xs text-muted-foreground">Updated 12m ago</div>
        </div>

        {/* Summary */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Environmental Summary</h3>
          <div className="grid grid-cols-2 gap-2.5">
            <MetricCard icon={Thermometer} label="Temperature" value={s.temperature.value} unit={s.temperature.unit} delta={s.temperature.delta} token="heat" />
            <MetricCard icon={Wind} label="AQI" value={s.aqi.value} delta={s.aqi.delta} token="aqi" />
            <MetricCard icon={Trees} label="Vegetation" value={s.vegetation.value} delta={Math.round(s.vegetation.delta * 100)} token="vegetation" />
            <MetricCard icon={CloudRain} label="Rainfall" value={s.rainfall.value} unit={s.rainfall.unit} delta={s.rainfall.delta} token="rainfall" />
          </div>
        </div>

        {/* Trends */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">12-month Trends</h3>
          <div className="space-y-2.5">
            <TrendCard title="Temperature (°C)" color="var(--heat)">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={temperatureTrend}>
                  <defs>
                    <linearGradient id="g-temp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--heat)" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="var(--heat)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="var(--heat)" strokeWidth={2} fill="url(#g-temp)" />
                  <Tooltip cursor={false} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11 }} />
                </AreaChart>
              </ResponsiveContainer>
            </TrendCard>

            <TrendCard title="Vegetation Index (NDVI)" color="var(--vegetation)">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vegetationTrend}>
                  <Line type="monotone" dataKey="value" stroke="var(--vegetation)" strokeWidth={2} dot={{ r: 2, fill: "var(--vegetation)" }} />
                  <Tooltip cursor={false} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11 }} />
                </LineChart>
              </ResponsiveContainer>
            </TrendCard>

            <TrendCard title="Rainfall (mm)" color="var(--rainfall)">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rainfallTrend}>
                  <Bar dataKey="value" fill="var(--rainfall)" radius={[3, 3, 0, 0]} />
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} interval={1} />
                  <Tooltip cursor={false} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11 }} />
                </BarChart>
              </ResponsiveContainer>
            </TrendCard>
          </div>
        </div>

        <button className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity">
          Ask Rit about this location
        </button>
      </div>
    </div>
  );
}
