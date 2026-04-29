import Link from "next/link";
import { ArrowLeft, Ghost } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center text-center px-4">
      <div className="relative mb-8">
        {/* Glow backdrop */}
        <div className="absolute inset-0 blur-3xl bg-primary/20 rounded-full animate-pulse" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-card border border-border shadow-2xl">
          <Ghost className="h-12 w-12 text-primary opacity-80" />
        </div>
      </div>
      
      <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl mb-4 bg-gradient-to-b from-foreground to-foreground/50 bg-clip-text text-transparent">
        404: Page Dissolved
      </h1>
      
      <p className="text-muted-foreground max-w-[500px] mb-10 text-lg leading-relaxed">
        The resource you are looking for has been processed, moved, or doesn't exist in our current digital ledger.
      </p>
      
      <Link
        href="/"
        className="group relative flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-bold text-primary-foreground transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Return to Dashboard
        
        {/* Shine effect on button */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out overflow-hidden" />
      </Link>
      
      {/* Decorative background grid */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
    </div>
  );
}
