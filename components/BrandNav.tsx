"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/recap", label: "Recap" },
  { href: "/settings", label: "Pengaturan" },
];

export function NavPills({ vertical = false }: { vertical?: boolean }) {
  const pathname = usePathname();
  return (
    <nav className={vertical ? "flex flex-col gap-1" : "flex items-center gap-1"}>
      {NAV.map((n) => (
        <Link key={n.href} href={n.href} className={`nav-pill ${pathname === n.href ? "nav-pill-active" : ""}`}>
          {n.label}
        </Link>
      ))}
    </nav>
  );
}

export default function BrandNav() {
  return (
    <div className="flex items-center gap-6">
      <Link href="/" className="flex items-center gap-2">
        <img src="/logo-mark.svg" alt="" className="h-9 w-9" />
        <span className="font-display text-xl font-bold tracking-tight text-navy">EasyLearnn</span>
      </Link>
      <div className="hidden md:block">
        <NavPills />
      </div>
    </div>
  );
}
