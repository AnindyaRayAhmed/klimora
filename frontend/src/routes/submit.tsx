import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAppStore } from "@/store";
import { climateClient } from "@/lib/api/domains.client";
import { Camera, Video, MapPin, FileText, CheckCircle2, Upload, Trees, Bike, Users, ShieldAlert, Sparkles, Clock } from "lucide-react";
import { toast } from "sonner";
import { VerificationBadge } from "@/components/VerificationBadge";

export const Route = createFileRoute("/submit")({
  head: () => ({
    meta: [
      { title: "Submit Mission — Klimora" },
      { name: "description", content: "Submit verified climate actions. Media evidence is analysed by Klimora Verification AI." },
    ],
  }),
  component: SubmitPage,
});

type Field = "media" | "gps" | "species" | "route" | "ticket" | "description";
type MissionType = { id: string; label: string; icon: typeof Trees; points: number; fields: Field[] };

const types: MissionType[] = [
  { id: "tree-plant", label: "Tree Planting",    icon: Trees,       points: 100, fields: ["media", "gps", "species"] },
  { id: "tree-maintain", label: "Tree Maintenance", icon: Trees,    points: 50,  fields: ["media", "gps"] },
  { id: "transport", label: "Public Transport",  icon: Bike,        points: 10,  fields: ["route", "ticket"] },
  { id: "cleanup",   label: "Community Cleanup", icon: Users,       points: 100, fields: ["media", "gps", "description"] },
  { id: "civic",     label: "Civic Report",      icon: ShieldAlert, points: 80,  fields: ["media", "gps", "description"] },
];

type MediaItem = { url: string; kind: "image" | "video"; name: string };

const SPECIES_OPTIONS = [
  "Neem (Azadirachta indica)",
  "Banyan (Ficus benghalensis)",
  "Peepal (Ficus religiosa)",
  "Indian Almond (Terminalia catappa)",
  "Pongamia / Karanj (Pongamia pinnata)",
  "Arjun (Terminalia arjuna)",
  "Jamun (Syzygium cumini)",
  "Mango (Mangifera indica)",
  "Amla (Phyllanthus emblica)",
  "Ashoka (Saraca asoca)",
  "Gulmohar (Delonix regia)",
  "Kadamba (Neolamarckia cadamba)",
  "Mahogany",
  "Teak (Tectona grandis)",
  "Bamboo",
  "Coconut Palm",
  "Date Palm",
  "Silver Oak",
  "Rain Tree",
  "Tamarind",
  "Moringa (Drumstick Tree)",
  "Bael",
  "Jackfruit",
  "Indian Coral Tree",
  "Other (Specify)",
];

import { useAuth } from "@/hooks/use-auth";
import { Navigate } from "@tanstack/react-router";

function SubmitPage() {
  const { user, isLoading } = useAuth();
  const [selected, setSelected] = useState<string>("tree-plant");
  const [media, setMedia] = useState<MediaItem | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [species, setSpecies] = useState<string>(SPECIES_OPTIONS[0]);
  const [otherSpecies, setOtherSpecies] = useState<string>("");

  const { detectedCoordinates, setDetectedCoordinates } = useAppStore();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(detectedCoordinates);
  const [locationText, setLocationText] = useState<string>("Detecting location...");
  const [isLocating, setIsLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  const refreshLocation = () => {
    console.log("[Submission] Refreshing geolocation");
    setIsLocating(true);
    setLocError(null);
    
    if (!navigator.geolocation) {
      setLocError("Location unavailable");
      setIsLocating(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("[Submission] Coordinates updated", latitude, longitude);
        setDetectedCoordinates({ lat: latitude, lng: longitude });
        setCoords({ lat: latitude, lng: longitude });
        
        climateClient.getDynamicScore(latitude, longitude).then(res => {
          const city = res.data?.city || res.data?.name || "Unknown Location";
          const state = res.data?.state || "";
          const fullLoc = state ? `${city}, ${state}` : city;
          console.log("[Submission] Reverse geocoded location updated:", fullLoc);
          setLocationText(fullLoc);
          setIsLocating(false);
        }).catch(err => {
          console.error(err);
          setLocationText(`${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`);
          setIsLocating(false);
        });
      },
      (err) => {
        console.error(err);
        setLocError("Enable location access");
        setIsLocating(false);
      },
      { timeout: 8000 }
    );
  };

  useEffect(() => {
    if (detectedCoordinates) {
      setCoords(detectedCoordinates);
      climateClient.getDynamicScore(detectedCoordinates.lat, detectedCoordinates.lng).then(res => {
        const city = res.data?.city || res.data?.name || "Unknown Location";
        const state = res.data?.state || "";
        const fullLoc = state ? `${city}, ${state}` : city;
        setLocationText(fullLoc);
      }).catch(() => {
        setLocationText(`${detectedCoordinates.lat.toFixed(4)}°N, ${detectedCoordinates.lng.toFixed(4)}°E`);
      });
    } else {
      refreshLocation();
    }
  }, []);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const current = types.find((t) => t.id === selected)!;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const kind: MediaItem["kind"] = f.type.startsWith("video") ? "video" : "image";
    setMedia({ url: URL.createObjectURL(f), kind, name: f.name });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success("Submission received — Klimora Verification AI is reviewing it.");
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-10">
        <div className="glass-strong rounded-3xl p-8 max-w-md w-full text-center relative overflow-hidden">
          <div className="absolute -top-16 -right-16 h-44 w-44 rounded-full opacity-20 blur-3xl" style={{ background: "var(--gradient-aurora)" }} />
          <div className="h-16 w-16 rounded-2xl mx-auto flex items-center justify-center mb-5 relative" style={{ background: "var(--gradient-forest)" }}>
            <CheckCircle2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Mission Submitted</h1>
          <p className="text-sm text-muted-foreground mb-5">
            Your evidence is being analysed by <span className="text-foreground font-medium">Klimora Verification AI</span>.
          </p>

          <div className="grid grid-cols-1 gap-2 mb-5 text-left">
            <div className="glass rounded-xl p-3 flex items-center gap-3">
              <Clock className="h-4 w-4 text-primary" />
              <div className="flex-1">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Estimated review time</div>
                <div className="text-sm font-semibold">Under 2 minutes</div>
              </div>
            </div>
            <div className="glass rounded-xl p-3 flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <div className="flex-1">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Current status</div>
                <div className="mt-0.5"><VerificationBadge status="pending" /></div>
              </div>
            </div>
            <div className="glass rounded-xl p-3 flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <div className="flex-1">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Reward</div>
                <div className="text-sm font-semibold">+{current.points} potential points</div>
                <div className="text-[10px] text-muted-foreground">Points are only awarded after verification.</div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => { setSubmitted(false); setMedia(null); }} className="flex-1 py-2.5 rounded-xl glass text-sm font-medium hover:bg-primary/10">
              Submit another
            </button>
            <Link to="/profile" className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
              View profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 md:px-8 py-6 md:py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-wider text-primary mb-2">Mission Submission</div>
          <h1 className="text-3xl font-bold tracking-tight">Verify your climate action</h1>
          <p className="text-muted-foreground mt-2">Submit media evidence — Klimora Verification AI reviews it in under 2 minutes.</p>
        </div>

        {/* Type selector */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
          {types.map((t) => {
            const Icon = t.icon;
            const active = selected === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelected(t.id)}
                className={`p-3 rounded-xl border text-left transition-all ${active ? "border-primary bg-primary/10" : "border-border glass hover:border-primary/40"}`}
              >
                <Icon className={`h-5 w-5 mb-2 ${active ? "text-primary" : "text-muted-foreground"}`} />
                <div className="text-xs font-medium leading-tight">{t.label}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">+{t.points} pts</div>
              </button>
            );
          })}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-strong rounded-2xl p-5 md:p-6 space-y-5">
          {current.fields.includes("media") && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
                <Camera className="h-3.5 w-3.5" /> Media evidence
              </label>

              <label className="block aspect-video rounded-xl border-2 border-dashed border-border bg-sidebar-accent/30 cursor-pointer overflow-hidden relative hover:border-primary/50 transition-colors">
                {media ? (
                  media.kind === "video" ? (
                    <video src={media.url} controls className="absolute inset-0 w-full h-full object-cover bg-black" />
                  ) : (
                    <img src={media.url} alt="evidence" className="absolute inset-0 w-full h-full object-cover" />
                  )
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Upload className="h-8 w-8" />
                    <span className="text-sm">Tap to upload photo or video</span>
                    <span className="text-[11px]">JPG, PNG, MP4, MOV • Geotag preferred</span>
                  </div>
                )}
                <input type="file" accept="image/*,video/*" onChange={handleFile} className="hidden" />
              </label>

              {/* Capture mode buttons */}
              <div className="grid grid-cols-3 gap-2 mt-2">
                <label className="cursor-pointer flex items-center justify-center gap-1.5 py-2 rounded-lg glass text-xs font-medium hover:bg-primary/10 transition-colors">
                  <Camera className="h-3.5 w-3.5 text-primary" /> Camera capture
                  <input type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />
                </label>
                <label className="cursor-pointer flex items-center justify-center gap-1.5 py-2 rounded-lg glass text-xs font-medium hover:bg-primary/10 transition-colors">
                  <Video className="h-3.5 w-3.5 text-primary" /> Record video
                  <input type="file" accept="video/*" capture="environment" onChange={handleFile} className="hidden" />
                </label>
                <label className="cursor-pointer flex items-center justify-center gap-1.5 py-2 rounded-lg glass text-xs font-medium hover:bg-primary/10 transition-colors">
                  <Upload className="h-3.5 w-3.5 text-primary" /> Upload file
                  <input type="file" accept="image/*,video/*" onChange={handleFile} className="hidden" />
                </label>
              </div>
              <div className="text-[10px] text-muted-foreground mt-1.5">Supported: JPG, PNG, MP4, MOV. AI verification typically completes in under 2 minutes.</div>
            </div>
          )}

          {current.fields.includes("gps") && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
                <MapPin className="h-3.5 w-3.5" /> Location
              </label>
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl glass">
                <div className={`h-2 w-2 rounded-full ${locError ? "bg-destructive" : coords ? "bg-success animate-pulse" : "bg-warning animate-pulse"}`} />
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {locError ? locError : isLocating ? "Detecting location..." : locationText}
                  </div>
                  {coords && !locError && (
                    <div className="text-[11px] text-muted-foreground">
                      {coords.lat.toFixed(4)}°N, {coords.lng.toFixed(4)}°E • ±8m accuracy
                    </div>
                  )}
                </div>
                <button 
                  type="button" 
                  onClick={refreshLocation} 
                  disabled={isLocating}
                  className="text-xs text-primary font-medium disabled:opacity-50"
                >
                  {isLocating ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>
          )}

          {current.fields.includes("route") && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Route tracking</label>
              <div className="px-4 py-3 rounded-xl glass">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">
                    {isLocating ? "Detecting route..." : locError ? "Route unavailable" : `${locationText} area`}
                  </span>
                  <span className="text-xs text-primary font-medium">Active</span>
                </div>
                <div className="h-2 rounded-full bg-sidebar-accent overflow-hidden">
                  <div className="h-full w-3/4 rounded-full" style={{ background: "var(--gradient-forest)" }} />
                </div>
                <div className="text-[11px] text-muted-foreground mt-1.5">GPS route captured • Low-emission corridor confirmed</div>
              </div>
            </div>
          )}

          {current.fields.includes("species") && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Species</label>
                <select
                  value={species}
                  onChange={(e) => setSpecies(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass bg-transparent text-sm outline-none focus:border-primary"
                >
                  {SPECIES_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              {species === "Other (Specify)" && (
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                    Plant Species Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={otherSpecies}
                    onChange={(e) => setOtherSpecies(e.target.value)}
                    placeholder="Enter plant species name"
                    className="w-full px-4 py-2.5 rounded-xl glass bg-transparent text-sm outline-none focus:border-primary"
                  />
                </div>
              )}
            </div>
          )}

          {current.fields.includes("ticket") && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Ticket / proof</label>
              <input type="file" accept="image/*,application/pdf" className="w-full text-sm" />
              <div className="text-[10px] text-muted-foreground mt-1">JPG, PNG, or PDF</div>
            </div>
          )}

          {current.fields.includes("description") && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
                <FileText className="h-3.5 w-3.5" /> Description
              </label>
              <textarea
                rows={3}
                placeholder="What did you observe or do?"
                className="w-full px-4 py-3 rounded-xl glass bg-transparent text-sm outline-none focus:border-primary resize-none"
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Potential reward</div>
              <div className="text-xl font-bold text-primary">+{current.points} pts</div>
              <div className="text-[10px] text-muted-foreground">Awarded after AI verification</div>
            </div>
            <button type="submit" className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90">
              Submit for verification
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
