import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { z } from "zod";
import { Send, Sparkles, Thermometer, Trees, CloudRain, Wind, Target, ChevronRight, MapPin, Clock, Database, Bell } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useAppStore } from "@/store";
import { useDashboardIntelligence } from "@/hooks/use-climate";
import { useRitChat } from "@/hooks/use-rit";

const searchSchema = z.object({
  locality: z.string().optional(),
});

export const Route = createFileRoute("/rit")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Rit — Climate Intelligence AI | Klimora" },
      { name: "description", content: "Context-aware climate AI. Get location-specific explanations for heat, vegetation, air quality, and resilience." },
    ],
  }),
  component: RitPage,
});


function parseInline(text: string): React.ReactNode[] {
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_|`[^`]+`)/g;
  const parts = text.split(regex);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index} className="font-bold text-primary">{part.slice(2, -2)}</strong>;
    }
    if ((part.startsWith("*") && part.endsWith("*")) || (part.startsWith("_") && part.endsWith("_"))) {
      return <em key={index} className="italic text-foreground/90 font-medium">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index} className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs text-foreground/90">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

function getSafeNumber(field: any, nestedKey: string): number | null {
  if (field === null || field === undefined) return null;
  if (typeof field === "number") return field;
  if (typeof field === "string") {
    const parsed = parseFloat(field);
    return isNaN(parsed) ? null : parsed;
  }
  if (typeof field === "object" && field[nestedKey] !== undefined) {
    const val = field[nestedKey];
    if (typeof val === "number") return val;
    if (typeof val === "string") {
      const parsed = parseFloat(val);
      return isNaN(parsed) ? null : parsed;
    }
  }
  return null;
}

function renderMarkdown(content: string): React.ReactNode {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  
  let currentList: { type: "ul" | "ol"; items: string[] } | null = null;
  
  const flushList = (key: number) => {
    if (!currentList) return null;
    const listKey = `list-${key}`;
    const listItems = currentList.items.map((item, idx) => (
      <li key={idx} className="ml-5 list-disc leading-relaxed mb-1 text-foreground/90">
        {parseInline(item)}
      </li>
    ));
    const list = currentList.type === "ul" ? (
      <ul key={listKey} className="list-inside space-y-1 my-3">
        {listItems}
      </ul>
    ) : (
      <ol key={listKey} className="list-decimal list-inside space-y-1 my-3">
        {listItems}
      </ol>
    );
    currentList = null;
    return list;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      if (currentList) {
        elements.push(flushList(i));
      }
      continue;
    }

    if (trimmed.startsWith("### ")) {
      if (currentList) elements.push(flushList(i));
      elements.push(
        <h4 key={i} className="text-sm font-bold mt-4 mb-2 text-foreground flex items-center gap-1">
          {parseInline(trimmed.slice(4))}
        </h4>
      );
      continue;
    }
    if (trimmed.startsWith("## ")) {
      if (currentList) elements.push(flushList(i));
      elements.push(
        <h3 key={i} className="text-base font-bold mt-5 mb-3 text-foreground border-b border-border/40 pb-1">
          {parseInline(trimmed.slice(3))}
        </h3>
      );
      continue;
    }
    if (trimmed.startsWith("# ")) {
      if (currentList) elements.push(flushList(i));
      elements.push(
        <h2 key={i} className="text-lg font-bold mt-6 mb-3 text-foreground">
          {parseInline(trimmed.slice(2))}
        </h2>
      );
      continue;
    }

    const ulMatch = trimmed.match(/^[-*+]\s+(.*)/);
    if (ulMatch) {
      const itemContent = ulMatch[1];
      if (currentList && currentList.type === "ol") {
        elements.push(flushList(i));
      }
      if (!currentList) {
        currentList = { type: "ul", items: [] };
      }
      currentList.items.push(itemContent);
      continue;
    }

    const olMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (olMatch) {
      const itemContent = olMatch[2];
      if (currentList && currentList.type === "ul") {
        elements.push(flushList(i));
      }
      if (!currentList) {
        currentList = { type: "ol", items: [] };
      }
      currentList.items.push(itemContent);
      continue;
    }

    if (currentList) {
      elements.push(flushList(i));
    }
    
    elements.push(
      <p key={i} className="my-2 text-foreground/90 leading-relaxed">
        {parseInline(line)}
      </p>
    );
  }

  if (currentList) {
    elements.push(flushList(lines.length));
  }

  return <div className="space-y-2">{elements}</div>;
}

function RitPage() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading Rit...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const { selectedLocalityId, setSelectedLocalityId } = useAppStore();
  const { localitiesRaw, localitiesWithPins, activeLocalityData } = useDashboardIntelligence();
  const { messages, thinking, sendMessage, insights } = useRitChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const locationName = (!activeLocalityData || activeLocalityData.name === "Dynamic Location") 
    ? "your location" 
    : activeLocalityData.name;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const send = (text: string) => {
    const climateMetrics = activeLocalityData ? {
      temperature: getSafeNumber(activeLocalityData.temperature, 'value'),
      temperatureC: getSafeNumber(activeLocalityData.temperature, 'value'),
      aqi: getSafeNumber(activeLocalityData.airQuality, 'aqi'),
      ndvi: getSafeNumber(activeLocalityData.vegetation, 'ndvi'),
      rainfall: getSafeNumber(activeLocalityData.rainfall, 'mm'),
      rainfallMm: getSafeNumber(activeLocalityData.rainfall, 'mm'),
      score: getSafeNumber(activeLocalityData.climateScore, 'score') ?? getSafeNumber(activeLocalityData, 'climateScore'),
      climateScore: getSafeNumber(activeLocalityData.climateScore, 'score') ?? getSafeNumber(activeLocalityData, 'climateScore'),
    } : undefined;

    sendMessage(text, climateMetrics);
    setInput("");
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 px-4 md:px-8 py-6">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 flex-1 min-h-0">
        {/* Chat */}
        <div className="glass-strong rounded-2xl flex flex-col h-[calc(100vh-190px)] md:h-[calc(100vh-140px)] overflow-hidden">
          <header className="px-5 py-4 border-b border-border/60 flex items-center gap-3">
            <div className="relative h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-aurora)" }}>
              <Sparkles className="h-5 w-5 text-white" />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success border-2 border-background" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold flex items-center gap-2">
                Rit
                <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/15 text-primary">Climate Analyst</span>
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                <MapPin className="h-3 w-3" />
                Context: <span className="text-foreground font-medium truncate">{locationName}</span>
              </div>
            </div>
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-5">
            {messages.map((m) => (
              <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                {m.role === "assistant" && (
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--gradient-aurora)" }}>
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                )}
                <div className={m.role === "user" ? "max-w-[80%]" : "max-w-[90%] flex-1"}>
                  {m.role === "user" ? (
                    <div className={`rounded-2xl rounded-tr-sm px-4 py-2.5 bg-primary text-primary-foreground text-sm ${m.isOptimistic ? "opacity-70" : ""}`}>
                      {m.content}
                    </div>
                  ) : (
                    <div className="text-sm leading-relaxed">{renderMarkdown(m.content)}</div>
                  )}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--gradient-aurora)" }}>
                  <Sparkles className="h-4 w-4 text-white animate-pulse" />
                </div>
                <div className="flex items-center gap-1.5 px-1 py-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse [animation-delay:200ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse [animation-delay:400ms]" />
                  <span className="text-xs text-muted-foreground ml-2">Rit is analysing {locationName}…</span>
                </div>
              </div>
            )}
          </div>

          {messages.length <= 1 && (
            <div className="px-4 md:px-6 pb-3 flex flex-wrap gap-2">
              {["Why is this area hotter?", "What actions would help this locality most?", "What is my climate score?"].map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="text-xs px-3 py-1.5 rounded-full glass hover:bg-primary/10 hover:border-primary/40 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          <div className="p-3 md:p-4 border-t border-border/60">
            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="flex gap-2 items-end glass rounded-xl p-2"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                placeholder={`Ask Rit about ${locationName}…`}
                rows={1}
                className="flex-1 bg-transparent outline-none px-2 py-2 text-sm resize-none max-h-32"
              />
              <button type="submit" disabled={!input.trim()} className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition-opacity">
                <Send className="h-4 w-4" />
              </button>
            </form>
            <div className="text-[10px] text-muted-foreground mt-2 text-center">
              Rit uses live climate and satellite data. Analytical responses — not a substitute for official advisories.
            </div>
          </div>
        </div>

        {/* Side panel */}
        <aside className="space-y-4">
          
          {insights.length > 0 && (
            <div className="glass-strong rounded-2xl p-5 border-l-4 border-warning">
              <div className="flex items-center gap-2 mb-3">
                <Bell className="h-4 w-4 text-warning" />
                <h3 className="text-sm font-semibold">Proactive Insights</h3>
              </div>
              <div className="space-y-3">
                {insights.map(i => (
                  <div key={i.id} className="text-xs text-foreground/90 bg-muted/20 p-2 rounded-md">
                    <span className="font-semibold">{i.severity}:</span> {i.content}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="glass-strong rounded-2xl p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Environmental Context</h3>
            <div className="text-sm font-semibold mb-3">{locationName}</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Thermometer, label: "Temp", value: activeLocalityData ? `${getSafeNumber(activeLocalityData.temperature, 'value') ?? '--'}°C` : "--", token: "heat" },
                { icon: Wind, label: "AQI", value: activeLocalityData ? (getSafeNumber(activeLocalityData.airQuality, 'aqi') ?? '--') : "--", token: "aqi" },
                { icon: Trees, label: "NDVI", value: activeLocalityData ? (getSafeNumber(activeLocalityData.vegetation, 'ndvi')?.toFixed(2) ?? '--') : "--", token: "vegetation" },
                { icon: CloudRain, label: "Rain", value: activeLocalityData ? `${getSafeNumber(activeLocalityData.rainfall, 'mm') ?? '--'}mm` : "--", token: "rainfall" },
              ].map(({ icon: Icon, label, value, token }) => (
                <div key={label} className="glass rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                    <Icon className="h-3 w-3" style={{ color: `var(--${token})` }} />
                    {label}
                  </div>
                  <div className="text-base font-semibold">{value}</div>
                </div>
              ))}
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
}
