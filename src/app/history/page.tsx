import { Suspense } from "react";
import { HistoryView } from "./components/HistoryView";
import { HistoryCardSkeleton } from "@/components/ui/skeleton";

export default function HistoryPage() {
  return (
    <main>
      <Suspense
        fallback={
          <div className="container-app py-8">
            <div className="mb-8">
              <div className="bg-muted mb-2 h-8 w-32 animate-pulse rounded" />
              <div className="bg-muted h-4 w-48 animate-pulse rounded" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <HistoryCardSkeleton key={i} />
              ))}
            </div>
          </div>
        }
      >
        <HistoryView />
      </Suspense>
    </main>
  );
}
