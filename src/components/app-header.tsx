import Link from "next/link";
import { AS_OF } from "@/modules/signals/score";

const nav = [
  { href: "/", label: "Dashboard" },
  { href: "/queue", label: "Queue" },
  { href: "/ask", label: "Ask" },
  { href: "/upload", label: "Upload account" },
  { href: "/reliability", label: "Reliability" },
];

export function AppHeader() {
  return (
    <header className="bg-card border-b">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-8 px-6">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-primary text-xl font-semibold tracking-tight">Renewal Rescue Desk</span>
        </Link>
        <nav className="text-muted-foreground flex flex-1 items-center gap-6 text-base">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-foreground transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>
        <span className="text-muted-foreground text-sm italic">Data as of {AS_OF}</span>
      </div>
      <div className="bg-primary/70 h-0.5" />
    </header>
  );
}
