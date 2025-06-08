import Link from 'next/link';
import { Home } from 'lucide-react';

export function Header() {
  return (
    <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <h1 className="text-foreground font-medium">
          Bank Statement Validator
        </h1>
        <Link
          href="/"
          className="text-foreground hover:text-primary inline-flex items-center gap-2 transition-colors"
        >
          <Home className="h-5 w-5" />
          <span>Home</span>
        </Link>
      </div>
    </header>
  );
}
