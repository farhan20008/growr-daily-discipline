import { ScanLine, Camera, Barcode } from 'lucide-react';

export default function ScanPage() {
  return (
    <div className="px-5 pt-12 pb-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">Scan</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Quick food logging</p>
      </div>

      <div className="flex flex-col items-center gap-6 py-8">
        {/* Meal Scan */}
        <div className="w-full rounded-2xl bg-card p-6 shadow-sm text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <Camera className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold font-heading text-foreground mb-1">Meal Scan</h3>
          <p className="text-sm text-muted-foreground mb-4">Take a photo of your meal and auto-detect food items</p>
          <div className="inline-block rounded-full bg-accent px-4 py-1.5">
            <span className="text-xs font-medium text-accent-foreground">Coming Soon</span>
          </div>
        </div>

        {/* Barcode Scan */}
        <div className="w-full rounded-2xl bg-card p-6 shadow-sm text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <Barcode className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold font-heading text-foreground mb-1">Barcode Scan</h3>
          <p className="text-sm text-muted-foreground mb-4">Scan packaged food barcode for instant nutrition info</p>
          <div className="inline-block rounded-full bg-accent px-4 py-1.5">
            <span className="text-xs font-medium text-accent-foreground">Coming Soon</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-accent/50 p-4">
        <p className="text-xs text-accent-foreground font-medium mb-1">For now</p>
        <p className="text-sm text-foreground/80">Use the Meals tab to quickly log your food with one-tap chips. It's faster than you think.</p>
      </div>
    </div>
  );
}
