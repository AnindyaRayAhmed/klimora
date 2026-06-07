import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Bell, User as UserIcon, Sparkles } from "lucide-react";
import { MapCanvas } from "@/components/MapCanvas";
import { LayerSwitcher } from "@/components/LayerSwitcher";
import { ClimateHealthCard } from "@/components/ClimateHealthCard";
import { ScoreBreakdown } from "@/components/ScoreBreakdown";
import { ForecastCard } from "@/components/ForecastCard";
import { LocalityInsights } from "@/components/LocalityInsights";
import { ClimateTimeline } from "@/components/ClimateTimeline";
import { Logo } from "@/components/Logo";
import { useDashboardIntelligence } from "@/hooks/use-climate";
import { useAppStore } from "@/store";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Klimora — Climate Intelligence Platform" },
      { name: "description", content: "Interactive climate intelligence: heat, vegetation, air quality, rainfall, and climate health scores for every locality." },
    ],
  }),
  component: ClimateDashboard,
});

function ClimateDashboard() {
  const { activeClimateLayer, setActiveClimateLayer, selectedLocalityId, setSelectedLocalityId } = useAppStore();
  const { activeLocalityData, localitiesWithPins, loadingInitial, isHydratingScore } = useDashboardIntelligence();
  const { user } = useAuth();

  const handleLocationClick = (id: string) => {
    setSelectedLocalityId(id);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="px-4 md:px-6 pt-4 pb-3 flex flex-col gap-3 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="glass-strong rounded-xl px-3 py-2 flex items-center gap-2">
            <Logo />
          </div>

          <div className="flex-1 max-w-xl glass-strong rounded-xl px-3.5 py-2.5 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search a locality, ward, or city…"
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            />
            <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] text-muted-foreground border border-border/60">⌘K</kbd>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Link to="/rit" search={{ locality: selectedLocalityId || undefined }} className="glass-strong h-10 px-3 rounded-xl flex items-center gap-2 text-sm hover:bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
              Ask Rit
            </Link>
            <button className="glass-strong h-10 w-10 rounded-xl flex items-center justify-center hover:bg-primary/10 relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-accent" />
            </button>
            <Link to="/profile" className="glass-strong h-10 px-3 rounded-xl flex items-center gap-2 hover:bg-primary/10">
              {user ? (
                <>
                  <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold text-primary-foreground" style={{ background: "var(--gradient-data)" }}>
                    {user.email?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="text-sm truncate max-w-[80px]">{user.user_metadata?.full_name || "Profile"}</span>
                </>
              ) : (
                <>
                  <UserIcon className="h-4 w-4" />
                  <span className="text-sm">Sign In</span>
                </>
              )}
            </Link>
          </div>

          <Link to="/profile" className="md:hidden glass-strong h-10 w-10 rounded-xl flex items-center justify-center">
            <UserIcon className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <LayerSwitcher value={activeClimateLayer} onChange={setActiveClimateLayer as any} />
          <div className="hidden md:flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className={`h-1.5 w-1.5 rounded-full bg-success ${isHydratingScore ? 'animate-pulse' : ''}`} />
            Live · {isHydratingScore ? 'Hydrating...' : 'Real-time intelligence'}
          </div>
        </div>
      </header>

      {/* Main split layout */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Map ~65% on desktop, ~55vh on mobile */}
        <div className="relative h-[55vh] lg:h-auto lg:flex-1 lg:basis-[65%] min-h-[360px] transition-opacity duration-500">
          {!loadingInitial && (
            <MapCanvas 
              layer={activeClimateLayer as any} 
              selectedId={selectedLocalityId as any} 
              onLocationClick={handleLocationClick as any} 
              localitiesOverride={localitiesWithPins}
            />
          )}
        </div>

        {/* Intelligence rail ~35% */}
        <aside className={`lg:w-[420px] xl:w-[460px] lg:border-l border-t lg:border-t-0 border-border/40 overflow-y-auto transition-opacity duration-300 ${isHydratingScore ? 'opacity-60' : 'opacity-100'}`}>
          <div className="p-4 md:p-5 space-y-4">
            {loadingInitial ? (
               <div className="animate-pulse space-y-4">
                 <div className="h-48 bg-muted/20 rounded-2xl"></div>
                 <div className="h-32 bg-muted/20 rounded-2xl"></div>
               </div>
            ) : (
              <>
                <ClimateHealthCard locality={activeLocalityData} />
                <ScoreBreakdown locality={activeLocalityData} />
                <ForecastCard locality={activeLocalityData} />
                <LocalityInsights locality={activeLocalityData} />
                <ClimateTimeline />
              </>
            )}

            <div className="rounded-2xl p-3 border border-dashed border-border/60 text-[11px] text-muted-foreground">
              <span className="text-primary font-medium">Tip:</span> Tap any pin on the map to update the climate intelligence panel.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
