import logoUrl from "../assets/logo.svg";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative h-8 w-8 shrink-0">
        <img src={logoUrl} className="h-8 w-8" alt="Klimora Logo" />
        <div className="absolute inset-0 rounded-full blur-xl bg-primary/30 -z-10" />
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-base font-semibold tracking-tight">Klimora</span>
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Climate Intelligence</span>
      </div>
    </div>
  );
}
