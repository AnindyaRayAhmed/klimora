export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative h-8 w-8">
        <svg viewBox="0 0 32 32" className="h-8 w-8">
          <defs>
            <linearGradient id="klimora-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="oklch(0.7 0.18 152)" />
              <stop offset="100%" stopColor="oklch(0.55 0.16 200)" />
            </linearGradient>
          </defs>
          <circle cx="16" cy="16" r="14" fill="url(#klimora-grad)" opacity="0.18" />
          <path
            d="M16 4 C 10 10, 7 14, 7 19 a 9 9 0 0 0 18 0 c 0 -5 -3 -9 -9 -15 z"
            fill="url(#klimora-grad)"
          />
          <path d="M16 10 v 14 M12 16 l 4 -3 4 3" stroke="oklch(0.18 0.02 175)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 rounded-full blur-xl bg-primary/30 -z-10" />
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-base font-semibold tracking-tight">Klimora</span>
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Climate Intelligence</span>
      </div>
    </div>
  );
}
