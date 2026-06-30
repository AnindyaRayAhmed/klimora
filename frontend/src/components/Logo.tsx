import logoUrl from "../assets/logo.svg";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative h-11 w-11 shrink-0">
        <img src={logoUrl} className="h-11 w-11" alt="Klimora Logo" />
        <div className="absolute inset-0 rounded-full blur-xl bg-primary/30 -z-10" />
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-xl md:text-2xl font-bold tracking-tight text-foreground">Klimora</span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5">Climate Intelligence</span>
      </div>
    </div>
  );
}
