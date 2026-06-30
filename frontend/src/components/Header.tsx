import { Link } from "@tanstack/react-router";
import { Bell, User as UserIcon, Sparkles } from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "@/hooks/use-auth";
import { useAppStore } from "@/store";

export function Header() {
  const { user } = useAuth();
  const { selectedLocalityId } = useAppStore();

  return (
    <header className="fixed top-0 left-0 md:left-[72px] right-0 z-30 h-[76px] px-4 md:px-6 flex items-center justify-between border-b border-border/40 bg-background/85 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <Link to="/" className="hover:opacity-90 transition-opacity">
          <Logo />
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <Link to="/rit" search={{ locality: selectedLocalityId || undefined }} className="hidden md:flex glass-strong h-10 px-3 rounded-xl items-center gap-2 text-sm hover:bg-primary/10">
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
              <span className="text-sm truncate max-w-[80px] hidden sm:inline">{user.user_metadata?.full_name || "Profile"}</span>
            </>
          ) : (
            <>
              <UserIcon className="h-4 w-4" />
              <span className="text-sm hidden sm:inline">Sign In</span>
            </>
          )}
        </Link>
      </div>
    </header>
  );
}
