import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Trophy, Users, TrendingUp, Minus, MapPin, ArrowUp, ArrowDown } from "lucide-react";
import { useCommunity } from "@/hooks/use-community";
import { useDashboardIntelligence } from "@/hooks/use-climate";
import { type Ranking } from "@/lib/ui-constants";

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

function CommunityPage() {
  const { leaderboard, wardRankings, loading, isUnavailable } = useCommunity();
  const { activeLocalityData } = useDashboardIntelligence();
  const [scope, setScope] = useState<Scope>("ward");

  if (loading || !activeLocalityData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <span className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-xs text-muted-foreground">Loading community insights...</span>
        </div>
      </div>
    );
  }

  // Locate my ward in the active ranking list
  const myWard = wardRankings.find((r) => r.id === activeLocalityData.id) || 
    (wardRankings[0] ? wardRankings[0] : { rank: '-', name: activeLocalityData.name, score: activeLocalityData.climateScore, trend: 'flat', movement: 0 });

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
        </div>

        {isUnavailable ? (
          <div className="glass-strong rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-4 min-h-[40vh]">
            <div className="h-16 w-16 rounded-full bg-sidebar-accent flex items-center justify-center mb-2">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold">Community Features Coming Soon</h2>
            <p className="text-sm text-muted-foreground max-w-md">
              We are currently building out the community leaderboards, climate rankings, and impact movement features. 
              Check back soon to see how your ward compares to others!
            </p>
          </div>
        ) : (
          <>
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
                {/* Fallbacks removed */}
              </div>
            </section>

            {/* Leaderboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                        {u.name.split(" ").map((n: string) => n[0]).join("")}
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
            </div>
          </>
        )}
      </div>
    </div>
  );
}
