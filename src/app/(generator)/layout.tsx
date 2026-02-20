"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "Transfer" },
  { href: "/transaction", label: "Transaction" },
  { href: "/message", label: "Message" },
];

export default function GeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div>
      <div className="pt-4 mb-6 border-b border-border">
        <div className="container-app">
          <nav className="-mb-px flex gap-6">
            {tabs.map((tab) => {
              const isActive =
                pathname === tab.href ||
                (tab.href !== "/" && pathname.startsWith(tab.href));
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "border-b-2 pb-3 text-sm font-medium transition-colors",
                    isActive
                      ? "border-solana-purple text-solana-purple"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      {children}
    </div>
  );
}
