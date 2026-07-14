import { Hand, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Hand className="h-4 w-4" strokeWidth={2.2} />
            </span>
            <span className="text-lg font-extrabold tracking-tight">Mudraa</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Bridging silence with understanding — sign language to text, in real time.
          </p>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            Made with <Heart className="h-3.5 w-3.5 fill-primary text-primary" /> for the community
          </p>
        </div>
      </div>
    </footer>
  );
}
