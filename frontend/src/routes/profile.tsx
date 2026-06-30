import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Award, TrendingUp, Calendar, Settings, CheckCircle2, Shield, Trees, Droplets, Flame, Leaf, Users, ShieldCheck } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";
import { VerificationBadge, VerifiedByChip } from "@/components/VerificationBadge";
import { VerificationDetails } from "@/components/VerificationDetails";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Klimora" },
      { name: "description", content: "Your climate impact: points, badges, mission history, and titles." },
    ],
  }),
  component: ProfilePage,
});

import { useAuth } from "@/hooks/use-auth";

const titleIcons: Record<string, typeof Trees> = {
  "Canopy Keeper": Trees,
  "Heat Defender": Flame,
  "Green Steward": Leaf,
  "Climate Ranger": Shield,
  "Community Guardian": Users,
  "Water Sentinel": Droplets,
};

function ProfilePage() {
  const { user, isLoading, signOut } = useAuth();
  const { profile: u, missionHistory, verificationQueue, loading, updateProfile, deleteAccount } = useProfile();
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [locName, setLocName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenSettings = () => {
    if (u) {
      setDisplayName(u.fullName || "");
      setLocName(u.location || "");
    }
    setIsSettingsOpen(true);
  };

  if (isLoading || loading) return <div className="min-h-screen flex items-center justify-center bg-background">Loading profile...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!u) return <div className="min-h-screen flex items-center justify-center bg-background">Loading profile...</div>;

  const progress = u.nextLevelAt ? ((u.points || 0) / u.nextLevelAt) * 100 : 0;

  return (
    <div className="min-h-screen px-4 md:px-8 py-6 md:py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Profile header */}
        <div className="glass-strong rounded-3xl p-6 md:p-8 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full opacity-25 blur-3xl" style={{ background: "var(--gradient-aurora)" }} />

          <div className="flex flex-col md:flex-row md:items-center gap-5 relative">
            <div className="relative">
              <div className="h-24 w-24 rounded-2xl flex items-center justify-center text-3xl font-bold text-primary-foreground" style={{ background: "var(--gradient-forest)" }}>
                AK
              </div>
              <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md bg-background border border-border text-xs font-semibold">
                Lv {u.level}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{u.fullName}</h1>
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div className="text-sm text-muted-foreground">@{u.username}</div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {u.location}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Joined {u.joined}</span>
              </div>
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/40 bg-primary/10">
                <Trees className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">{u.title}</span>
              </div>
            </div>

            <button 
              onClick={handleOpenSettings}
              className="self-start md:self-center h-10 w-10 rounded-xl glass flex items-center justify-center hover:bg-primary/10 transition-colors"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>

          {/* Level progress */}
          <div className="mt-6 relative">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>{(u.points || 0).toLocaleString()} pts</span>
              <span>{(u.nextLevelAt || 0).toLocaleString()} pts → Lv {(u.level || 0) + 1}</span>
            </div>
            <div className="h-2 bg-sidebar-accent rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: "var(--gradient-forest)" }} />
            </div>
          </div>
        </div>

        {/* Points summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total points", value: (u.points || 0).toLocaleString(), icon: Award, token: "primary" },
            { label: "This week", value: `+${u.weeklyPoints || 0}`, icon: TrendingUp, token: "vegetation" },
            { label: "This month", value: `+${u.monthlyPoints || 0}`, icon: Calendar, token: "rainfall" },
            { label: "Completed", value: u.completed || 0, icon: CheckCircle2, token: "accent" },
          ].map((s) => {
            const Icon = s.icon || Award;
            return (
              <div key={s.label} className="glass-strong rounded-2xl p-4">
                <Icon className="h-4 w-4 mb-2" style={{ color: `var(--${s.token})` }} />
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
                <div className="text-2xl font-bold mt-1">{s.value}</div>
              </div>
            );
          })}
        </div>

        {/* Badges */}
        <section className="glass-strong rounded-2xl p-6">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Award className="h-4 w-4 text-warning" /> Climate Titles
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {["Canopy Keeper", "Heat Defender", "Green Steward", "Water Sentinel", "Climate Ranger", "Community Guardian"].map((b) => {
              const earned = (u.badges || []).includes(b);
              const Icon = titleIcons[b] || Award;
              return (
                <div
                  key={b}
                  className={`rounded-xl p-3 text-center transition-all ${
                    earned ? "glass border-primary/30" : "opacity-40 glass"
                  }`}
                >
                  <div className={`h-12 w-12 mx-auto rounded-xl flex items-center justify-center mb-2 ${earned ? "" : "grayscale"}`}
                    style={earned ? { background: "var(--gradient-forest)" } : { background: "var(--muted)" }}>
                    <Icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="text-[11px] font-medium leading-tight">{b}</div>
                  {!earned && <div className="text-[10px] text-muted-foreground mt-0.5">Locked</div>}
                </div>
              );
            })}
          </div>
        </section>

        {/* Mission history */}
        <section className="glass-strong rounded-2xl p-6">
          <h2 className="text-sm font-semibold mb-4">Mission History</h2>
          <div className="divide-y divide-border/40">
            {(missionHistory || []).map((m) => {
              const isVerified = m.status === "verified";
              return (
                <div key={m.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isVerified ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
                  }`}>
                    {isVerified ? <CheckCircle2 className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{m.title}</div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-2 flex-wrap mt-0.5">
                      <span>{m.date}</span>
                      <VerificationBadge status={m.status} size="xs" />
                      {isVerified && <VerifiedByChip by={m.verifiedBy} />}
                      {m.confidence > 0 && <span>· {m.confidence}% confidence</span>}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-primary">+{m.points}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Verification Center */}
        <section className="glass-strong rounded-2xl p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" /> Verification Center
            </h2>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Powered by Klimora AI</span>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            AI moderation status and decisions for your submitted missions. Confidence reflects how strongly evidence matches the mission.
          </p>

          <div className="space-y-3">
            {(verificationQueue || []).map((v) => (
              <div key={v.id} className="rounded-xl glass p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{v.title}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">Submitted {v.submittedAt}</div>
                  </div>
                  <VerificationBadge status={v.status} />
                </div>

                <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-3 flex-wrap">
                  {v.confidence > 0 && <span>Confidence <span className="text-foreground font-semibold">{v.confidence}%</span></span>}
                  {v.note && <span>· {v.note}</span>}
                  {v.status === "verified" && <VerifiedByChip by={v.verifiedBy} />}
                </div>

                <VerificationDetails
                  data={{
                    status: v.status,
                    confidence: v.confidence,
                    detected: v.detected,
                    metadata: v.metadata,
                    resultText: v.resultText,
                    notes: v.note,
                  }}
                />
              </div>
            ))}
          </div>
        </section>
      </div>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card text-foreground border-border rounded-2xl p-6 shadow-glow">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" /> Account Settings
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Manage your personal info, locality preferences, and account security.
            </DialogDescription>
          </DialogHeader>

          {/* Form */}
          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label htmlFor="displayName" className="text-xs font-semibold text-muted-foreground">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter display name"
                className="bg-background border-border text-foreground"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="location" className="text-xs font-semibold text-muted-foreground">Locality / Location</Label>
              <Input
                id="location"
                value={locName}
                onChange={(e) => setLocName(e.target.value)}
                placeholder="Enter locality (e.g. Ballygunge)"
                className="bg-background border-border text-foreground"
              />
              <span className="text-[10px] text-muted-foreground block leading-tight">
                Supported database locations: Ballygunge, Jadavpur, Salt Lake, New Town, Park Street
              </span>
            </div>

            <Button 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/95 mt-2"
              disabled={isSaving}
              onClick={async () => {
                setIsSaving(true);
                try {
                  await updateProfile(displayName, locName);
                  toast.success("Profile updated successfully");
                  setIsSettingsOpen(false);
                } catch (e) {
                  toast.error("Failed to update profile");
                } finally {
                  setIsSaving(false);
                }
              }}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>

          <hr className="border-border/60" />

          {/* Authentication */}
          <div className="py-2">
            <Label className="text-xs font-semibold text-muted-foreground block mb-2">Session</Label>
            <Button 
              variant="outline" 
              className="w-full border-border hover:bg-muted"
              onClick={async () => {
                await signOut();
                toast.success("Logged out successfully");
              }}
            >
              Log Out
            </Button>
          </div>

          <hr className="border-border/60" />

          {/* Danger Zone */}
          <div className="py-2 border border-destructive/20 bg-destructive/5 rounded-xl p-4">
            <h4 className="text-xs font-bold text-destructive uppercase tracking-wider mb-1">Danger Zone</h4>
            <p className="text-[10px] text-muted-foreground mb-3 leading-normal">
              Permanently delete your account and all associated environmental data. This action is irreversible.
            </p>
            <Button 
              variant="destructive" 
              className="w-full"
              disabled={isDeleting}
              onClick={async () => {
                if (window.confirm("Are you absolutely sure you want to delete your account? This action is irreversible.")) {
                  setIsDeleting(true);
                  try {
                    await deleteAccount();
                    toast.success("Account deleted");
                  } catch (e) {
                    toast.error("Failed to delete account");
                  } finally {
                    setIsDeleting(false);
                  }
                }
              }}
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
