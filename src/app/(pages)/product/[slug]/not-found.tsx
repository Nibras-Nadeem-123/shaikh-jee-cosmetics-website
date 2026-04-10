import Link from 'next/link';
import { PackageOpen, ArrowLeft } from 'lucide-react';

export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center px-4">
      <div className="text-center max-w-md space-y-8">
        <div className="flex justify-center">
          <PackageOpen size={120} className="text-muted-foreground opacity-50" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Product Not Found</h1>
          <p className="text-lg text-muted-foreground">
            The product you're looking for doesn't exist or has been removed.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            <ArrowLeft size={20} />
            Browse Shop
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-4 border-2 border-border text-foreground font-bold rounded-full hover:bg-muted transition-all"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
