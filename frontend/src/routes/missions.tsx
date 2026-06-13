import { createFileRoute, Link } from "@tanstack/react-router";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { Trees, Bike, Users, ShieldAlert, Filter, ArrowRight, Sparkles, Leaf, Activity, MapPin, Info, ChevronDown } from "lucide-react";
import { useMissions } from "@/hooks/use-missions";
import { useAppStore } from "@/store";
import { useDashboardIntelligence } from "@/hooks/use-climate";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/missions")({
  head: () => ({
    meta: [
      { title: "Missions & Actions — Klimora" },
      { name: "description", content: "Personalised climate actions based on local intelligence and community impact." },
    ],
  }),
  component: MissionsPage,
});

const categoryConfig = {
  green: { label: "Green", icon: Trees, color: "var(--vegetation)" },
  mobility: { label: "Mobility", icon: Bike, color: "var(--rainfall)" },
  community: { label: "Community", icon: Users, color: "var(--accent)" },
  civic: { label: "Civic", icon: ShieldAlert, color: "var(--destructive)" },
} as const;

const difficultyColor: Record<string, string> = {
  Easy: "var(--success)",
  Medium: "var(--warning)",
  Hard: "var(--destructive)",
};

function ImpactChip({ label, value, token }: { label: string; value: string; token: string }) {
  return (
    <div className="rounded-lg px-2 py-1.5 bg-[color-mix(in_oklab,var(--card)_60%,transparent)] border border-border/40">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground leading-none">{label}</div>
      <div className="text-xs font-semibold tabular-nums mt-0.5" style={{ color: `var(--${token})` }}>{value}</div>
    </div>
  );
}

function MissionCard({ m, recommended = false, explanation, localityName }: { m: any; recommended?: boolean; explanation?: string; localityName: string }) {
  const cfg = categoryConfig[m.category as keyof typeof categoryConfig] || categoryConfig.green;
  const Icon = cfg.icon;
  const [whyOpen, setWhyOpen] = useState(false);
  
  return (
    <article className="glass-strong rounded-2xl p-5 hover:border-primary/40 transition-all group relative overflow-hidden flex flex-col">
      <div
        className="absolute -top-12 -right-12 h-32 w-32 rounded-full opacity-20 group-hover:opacity-30 transition-opacity blur-2xl"
        style={{ background: cfg.color }}
      />

      {recommended && (
        <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider z-10"
          style={{ background: "color-mix(in oklab, var(--primary) 18%, transparent)", color: "var(--primary)" }}>
          <Sparkles className="h-3 w-3" /> For you
        </div>
      )}

      <div className="flex items-start justify-between mb-3 relative z-10">
        <div className="h-11 w-11 rounded-xl flex items-center justify-center"
          style={{ background: `color-mix(in oklab, ${cfg.color} 18%, transparent)`, border: `1px solid color-mix(in oklab, ${cfg.color} 30%, transparent)` }}>
          <Icon className="h-5 w-5" style={{ color: cfg.color }} />
        </div>
        <div className={`text-right ${recommended ? "mt-5" : ""}`}>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Reward</div>
          <div className="text-xl font-bold text-primary">+{m.points}</div>
        </div>
      </div>

      <h3 className="text-base font-semibold mb-1 z-10">{m.title}</h3>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">{m.description}</p>

      <div className="flex flex-wrap gap-1.5 mb-3 z-10">
        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full glass">{cfg.label}</span>
        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full glass" style={{ color: difficultyColor[m.difficulty] || "var(--foreground)" }}>
          {m.difficulty}
        </span>
        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full glass">
          {m.impact} impact
        </span>
      </div>

      {/* Environmental Impact Calculator */}
      <div className="mb-3 z-10">
        <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
          <Activity className="h-3 w-3" /> Estimated Impact
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          <ImpactChip label="CO₂" value={`${m.co2Kg}kg`} token="vegetation" />
          <ImpactChip label="Community" value={`+${m.communityPts}`} token="community" />
          <ImpactChip label="Ward" value={`+${m.wardPts}`} token="primary" />
          <ImpactChip label="Score" value={`+${m.scoreLift}`} token="climate" />
        </div>
      </div>

      {/* Why Recommended? */}
      {recommended && explanation && (
        <div className="mb-3 rounded-lg border border-border/40 overflow-hidden z-10">
          <button
            onClick={() => setWhyOpen((v) => !v)}
            className="w-full px-2.5 py-1.5 flex items-center justify-between text-[11px] hover:bg-primary/5 transition-colors"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <Info className="h-3 w-3 text-primary" /> Why Recommended?
            </span>
            <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${whyOpen ? "rotate-180" : ""}`} />
          </button>
          {whyOpen && (
            <div className="px-3 pb-2.5 pt-1 text-[11px] text-muted-foreground">
               <p className="mb-1.5">{explanation}</p>
               <p className="text-[10px] italic">Based on {localityName}'s current climate profile.</p>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-border/40 mt-auto z-10">
        <div className="text-[10px] text-muted-foreground">
          <span className="block text-[9px] uppercase tracking-wider">Verification</span>
          <span>{m.verification}</span>
        </div>
        <Link to="/submit" search={{ mission: m.id }} className="flex items-center gap-1 text-xs font-medium text-primary hover:gap-2 transition-all">
          Start <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}

type Filter = "all" | "recommended" | "green" | "mobility" | "community" | "civic";

function MissionsPage() {
  const [filter, setFilter] = useState<Filter>("recommended");
  const { missions, recommendedIds, recommendationDetails, loading } = useMissions();
  const { activeLocalityData } = useDashboardIntelligence();

  const recommendedMissions = missions.filter(m => recommendedIds.has(m.id));

  const filtered =
    filter === "all"
      ? missions
      : filter === "recommended"
      ? (recommendedMissions.length > 0 ? recommendedMissions : missions)
      : missions.filter((m) => m.category === filter);

  const stats = {
    total: missions.length,
    points: missions.reduce((s, m) => s + m.points, 0),
    completedThisWeek: 0,
  };

  return (
    <div className="min-h-screen px-4 md:px-8 py-6 md:py-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary mb-2">
              <Sparkles className="h-3.5 w-3.5" /> Climate Action
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Missions</h1>
            <p className="text-muted-foreground mt-2 max-w-xl">
              Every action strengthens your locality's climate resilience. Recommended missions adapt to your area's conditions.
            </p>
          </div>
          <div className="flex gap-3">
            {[
              { label: "Available", value: stats.total },
              { label: "Max pts", value: stats.points.toLocaleString() },
              { label: "Done this week", value: stats.completedThisWeek },
            ].map((s) => (
              <div key={s.label} className="glass rounded-xl px-4 py-3 min-w-[110px]">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
                <div className="text-xl font-bold mt-0.5">{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended highlight banner */}
        {filter === "recommended" && recommendedMissions.length > 0 && (
          <div className="glass-strong rounded-2xl p-4 md:p-5 mb-6 flex flex-col md:flex-row md:items-center gap-4 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 h-44 w-44 rounded-full opacity-20 blur-3xl" style={{ background: "var(--gradient-aurora)" }} />
            <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 relative" style={{ background: "var(--gradient-data)" }}>
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0 relative">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-3 w-3" /> Tailored to {activeLocalityData?.name || "your location"}
              </div>
              <h2 className="text-base md:text-lg font-semibold mt-1">Recommended Missions for Your Locality</h2>
              <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
                Matched against local conditions — AI-selected based on immediate climate needs.
              </p>
            </div>
          </div>
        )}

        {/* Filter chips */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          {([
            { id: "recommended", label: "Recommended" },
            { id: "all", label: "All Missions" },
            { id: "green", label: "Green" },
            { id: "mobility", label: "Mobility" },
            { id: "community", label: "Community" },
            { id: "civic", label: "Civic" },
          ] as const).map((c) => {
            const active = filter === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setFilter(c.id as Filter)}
                className={`px-3.5 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  active ? "bg-primary text-primary-foreground" : "glass hover:bg-primary/10"
                }`}
              >
                {c.id === "recommended" && <Sparkles className="h-3 w-3" />}
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        {loading ? (
           <div className="flex items-center justify-center h-32">
             <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((m) => (
              <MissionCard 
                key={m.id} 
                m={m} 
                recommended={recommendedIds.has(m.id)} 
                explanation={recommendationDetails[m.id]}
                localityName={activeLocalityData?.name || "your location"} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

