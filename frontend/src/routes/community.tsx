import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Trophy, Trees, Users, Target, TrendingUp, TrendingDown, Minus, MapPin, Info, ArrowUp, ArrowDown } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar, Tooltip, XAxis, YAxis } from "recharts";
import { useCommunity } from "@/hooks/use-community";
import { useDashboardIntelligence } from "@/hooks/use-climate";
import { type Ranking } from "@/lib/ui-constants";
import { temperatureTrend, vegetationTrend, aqiTrend, rainfallTrend, municipalityRankings, cityRankings, wards } from "@/lib/ui-constants";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community Impact — Klimora" },
      { name: "description", content: "Climate rankings for wards, municipalities, and cities. See movement, top contributors, and environmental trends." },
    ],
  }),
  component: CommunityPage,
});

type Scope = "ward" | "municipality" | "city";

function StatCard({ icon: Icon, label, value, sub, token = "primary" }: { icon: typeof Trees; label: string; value: string; sub?: string; token?: string }) {
  return (
    <div className="glass-strong rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: `color-mix(in oklab, var(--${token}) 15%, transparent)` }}>
          <Icon className="h-5 w-5" style={{ color: `var(--${token})` }} />
        </div>
      </div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      {sub && <div className="text-xs text-success mt-1">{sub}</div>}
    </div>
  );
}

function Movement({ r }: { r: Ranking }) {
  if (r.trend === "flat") return <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground"><Minus className="h-3 w-3" />No change</span>;
  const up = r.trend === "up";
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${up ? "text-success" : "text-destructive"}`}>
      {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {Math.abs(r.movement)} {Math.abs(r.movement) === 1 ? "place" : "places"} this month
    </span>
  );
}

function RankingList({ title, data, accent }: { title: string; data: Ranking[]; accent: string }) {
  return (
    <div className="glass-strong rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Climate score</span>
      </div>
      <div className="space-y-2.5">
        {data.map((r) => (
          <div key={r.name} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-sidebar-accent/40 transition-colors">
            <div
              className={`h-9 w-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                r.rank === 1 ? "bg-warning/20 text-warning" :
                r.rank === 2 ? "bg-muted/40 text-foreground" :
                r.rank === 3 ? "bg-accent/20 text-accent" : "bg-sidebar-accent text-muted-foreground"
              }`}
            >
              #{r.rank}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{r.name}</div>
              <Movement r={r} />
            </div>
            <div className="text-right">
              <div className="text-base font-bold tabular-nums" style={{ color: accent }}>{r.score}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">/ 100</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartCard({ title, color, type, data, dataKey, xKey }: { title: string; color: string; type: "line" | "area" | "bar"; data: Array<Record<string, unknown>>; dataKey: string; xKey: string }) {
  return (
    <div className="glass-strong rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      </div>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          {type === "line" ? (
            <LineChart data={data}>
              <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} dot={{ r: 3, fill: color }} />
              <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip cursor={false} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11 }} />
            </LineChart>
          ) : type === "area" ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={`url(#grad-${title})`} />
              <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip cursor={false} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11 }} />
            </AreaChart>
          ) : (
            <BarChart data={data}>
              <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
              <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip cursor={false} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11 }} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function CommunityPage() {
  const { leaderboard, wardRankings, loading } = useCommunity();
  const { activeLocalityData } = useDashboardIntelligence();
  const [scope, setScope] = useState<Scope>("ward");

  // Locate my ward in the active ranking list
  const myWard = wardRankings.find((r) => r.id === activeLocalityData.id) || wardRankings[0] || { rank: 1, name: activeLocalityData.name, score: activeLocalityData.climateScore, trend: 'flat', movement: 0 };

  return (
    <div className="min-h-screen px-4 md:px-8 py-6 md:py-10">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary mb-2">
              <Users className="h-3.5 w-3.5" /> Community Impact
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{activeLocalityData.name}</h1>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
              <MapPin className="h-3.5 w-3.5" /> Bengaluru, Karnataka · {activeLocalityData.boundary}
            </div>
          </div>
          <div className="glass rounded-xl p-1 inline-flex gap-0.5">
            {(["ward", "municipality", "city"] as Scope[]).map((s) => (
              <button
                key={s}
                onClick={() => setScope(s)}
                className={`px-4 py-1.5 rounded-lg text-sm capitalize transition-colors ${scope === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* My Position banner */}
        <div className="glass-strong rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full opacity-20 blur-3xl" style={{ background: "var(--gradient-aurora)" }} />
          <div className="h-14 w-14 rounded-2xl flex items-center justify-center text-xl font-bold relative" style={{ background: "var(--gradient-data)", color: "white" }}>
            #{myWard.rank}
          </div>
          <div className="flex-1 min-w-0 relative">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Your Position</div>
            <div className="font-semibold text-base">#{myWard.rank} Climate Ward · {myWard.name}</div>
            <Movement r={myWard} />
          </div>
          <div className="text-right relative">
            <div className="text-2xl font-bold text-primary tabular-nums">{myWard.points || myWard.score}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Climate score</div>
          </div>
        </div>

        {/* Community Statistics */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Community Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={Users} label="Active users" value="1,248" sub="+84 this week" token="data" />
            <StatCard icon={Target} label="Missions completed" value="3,420" sub="+212 this week" token="accent" />
            <StatCard icon={Trees} label="Trees planted" value="842" sub="+18 this week" token="vegetation" />
            <StatCard icon={Trophy} label="Community points" value="124,800" sub="+8,420 this week" token="warning" />
          </div>
        </section>

        {/* Climate Rankings */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Climate Rankings</h2>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
              Movement reflects last 30 days
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <RankingList title="Ward Rankings" data={wardRankings} accent="var(--climate)" />
            <RankingList title="Municipality Rankings" data={municipalityRankings} accent="var(--primary)" />
            <RankingList title="City Rankings" data={cityRankings} accent="var(--secondary)" />
          </div>
        </section>

        {/* Environmental indicators */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Environmental Indicators</h2>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Info className="h-3.5 w-3.5" />
              Shown alongside community action — no causation implied
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ChartCard title="Temperature (°C)" color="var(--heat)" type="area" data={temperatureTrend} dataKey="value" xKey="month" />
            <ChartCard title="Vegetation Index (NDVI)" color="var(--vegetation)" type="line" data={vegetationTrend} dataKey="value" xKey="year" />
            <ChartCard title="AQI (Weekly)" color="var(--aqi)" type="line" data={aqiTrend} dataKey="value" xKey="day" />
            <ChartCard title="Rainfall (mm)" color="var(--rainfall)" type="bar" data={rainfallTrend} dataKey="value" xKey="month" />
          </div>
        </section>

        {/* Leaderboard + Wards */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
          <section className="glass-strong rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-4 w-4 text-warning" />
              <h2 className="text-sm font-semibold">Top Contributors</h2>
            </div>
            <div className="space-y-2">
              {leaderboard.map((u) => (
                <div key={u.rank} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-sidebar-accent/50 transition-colors">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                    u.rank === 1 ? "bg-warning/20 text-warning" :
                    u.rank === 2 ? "bg-muted/40 text-muted-foreground" :
                    u.rank === 3 ? "bg-accent/20 text-accent" : "bg-sidebar-accent text-muted-foreground"
                  }`}>
                    {u.rank}
                  </div>
                  <div className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-semibold text-primary-foreground shrink-0" style={{ background: "var(--gradient-data)" }}>
                    {u.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{u.name}</div>
                    <div className="text-[11px] text-muted-foreground">{u.ward} · {u.badge}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm">{u.points.toLocaleString()}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">pts</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-strong rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">Most Active Wards</h2>
            </div>
            <div className="space-y-3">
              {wards.map((w, i) => {
                const max = wards[0].points;
                const pct = (w.points / max) * 100;
                return (
                  <div key={w.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{i + 1}. {w.name}</span>
                      <span className="text-xs text-muted-foreground">{w.points.toLocaleString()} pts</span>
                    </div>
                    <div className="h-1.5 bg-sidebar-accent rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--gradient-data)" }} />
                    </div>
                    <div className="flex gap-3 text-[11px] text-muted-foreground mt-1.5">
                      <span>{w.users} users</span>
                      <span>·</span>
                      <span>{w.trees} trees</span>
                      <span>·</span>
                      <span>{w.missions} missions</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
