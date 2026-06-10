import { Link, useRouterState } from "@tanstack/react-router";
import { Map, Sparkles, Target, Users, Upload, User } from "lucide-react";
import { Logo } from "./Logo";

const nav = [
  { to: "/", label: "Map", icon: Map },
  { to: "/rit", label: "Rit AI", icon: Sparkles },
  { to: "/missions", label: "Missions", icon: Target },
  { to: "/community", label: "Community", icon: Users },
  { to: "/submit", label: "Submit", icon: Upload },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function AppNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-[72px] z-40 flex-col items-center py-4 glass-strong border-r border-border/50">
        <Link to="/" className="mb-6">
          <Logo className="[&>div:last-child]:hidden" />
        </Link>
        <nav className="flex flex-col gap-1.5">
          {nav.map(({ to, label, icon }) => {
            const Icon = icon || Map;
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`group relative flex h-11 w-11 items-center justify-center rounded-xl transition-all ${
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                }`}
                title={label}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.2 : 1.8} />
                {active && (
                  <span className="absolute left-0 h-5 w-0.5 rounded-r bg-primary" />
                )}
                <span className="absolute left-full ml-3 px-2 py-1 rounded-md text-xs whitespace-nowrap glass-strong opacity-0 -translate-x-1 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-border/50">
        <div className="flex items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {nav.map(({ to, label, icon }) => {
            const Icon = icon || Map;
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
