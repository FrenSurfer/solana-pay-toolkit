"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  QrCode,
  CheckCircle,
  PlayCircle,
  History,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Generate", icon: QrCode },
  { href: "/validate", label: "Validate", icon: CheckCircle },
  { href: "/simulate", label: "Simulate", icon: PlayCircle },
  { href: "/history", label: "History", icon: History },
];

export function Navigation() {
  const pathname = usePathname();

  const isGenerateActive =
    pathname === "/" ||
    pathname === "/transaction" ||
    pathname === "/message";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="container-app">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-solana-purple">
              <QrCode className="text-white dark:text-foreground" size={20} />
            </div>
            <span className="hidden font-bold text-lg text-foreground sm:block">
              Solana Pay Toolkit
            </span>
          </Link>

          <nav className="flex gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? isGenerateActive
                  : pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-solana-purple/20 text-solana-purple"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon size={18} />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
