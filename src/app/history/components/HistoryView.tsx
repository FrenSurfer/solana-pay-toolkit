"use client";

import { useEffect, useState, useCallback } from "react";
import { useHistoryStore } from "@/stores/historyStore";
import { QRPreviewCard } from "@/components/qr/QRPreviewCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { HistoryItem, QRType } from "@/types/solana-pay";
import { Search, QrCode } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { HistoryCardSkeleton } from "@/components/ui/skeleton";
import { ExportImportButtons } from "./ExportImportButtons";

export function HistoryView() {
  const {
    items,
    loading,
    privateMode,
    filter,
    setFilter,
    loadItems,
    deleteItem,
    filteredItems,
  } = useHistoryStore();

  const [searchQuery, setSearchQuery] = useState(() => {
    return useHistoryStore.getState().filter.search ?? "";
  });

  useEffect(() => {
    loadItems();
  }, [loadItems, filter.type]);

  // Sync search input to filter in real time (no debounce)
  useEffect(() => {
    const value = searchQuery.trim() || undefined;
    setFilter({ search: value });
  }, [searchQuery, setFilter]);

  const handleSearchInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  const handleClearFilters = () => {
    setSearchQuery("");
    setFilter({});
  };

  const handleDownload = (item: HistoryItem) => {
    const link = document.createElement("a");
    link.href = item.qrDataUrl;
    link.download = `solana-pay-${item.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const displayedItems = filteredItems();

  return (
    <div className="container-app py-8">
      {privateMode && (
        <div className="border-border bg-muted mb-6 rounded-lg border p-4">
          <p className="text-muted-foreground text-sm">
            History is unavailable in private browsing mode. Use normal
            browsing to save your QR codes.
          </p>
        </div>
      )}

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">History</h1>
          <p className="text-muted-foreground">
            {items.length} QR code{items.length !== 1 ? "s" : ""} generated
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ExportImportButtons disabled={privateMode} />
          <Select
            value={filter.type ?? "all"}
            onValueChange={(value) =>
              setFilter({ type: (value === "all" ? undefined : value) as QRType | undefined })
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
              <SelectItem value="transactionRequest">Transaction Request</SelectItem>
              <SelectItem value="message">Message</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleClearFilters}>
            Clear Filters
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search
            className="text-muted-foreground absolute left-3 top-1/2 size-[18px] -translate-y-1/2"
            size={18}
          />
          <Input
            placeholder="Search by label, address, message..."
            value={searchQuery}
            onChange={handleSearchInput}
            onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <HistoryCardSkeleton key={i} />
          ))}
        </div>
      ) : displayedItems.length === 0 ? (
        <EmptyState
          icon={QrCode}
          title={searchQuery.trim() ? "No matching QR codes" : "No QR codes found"}
          description={
            searchQuery.trim()
              ? `No label, address, message or memo matches "${searchQuery.trim()}". Clear the search to see all.`
              : "Generate your first QR code to see it here"
          }
          action={
            searchQuery.trim()
              ? undefined
              : { label: "Generate QR", href: "/generator" }
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayedItems.map((item) => (
            <QRPreviewCard
              key={item.id}
              item={item}
              onDelete={deleteItem}
              onDownload={handleDownload}
            />
          ))}
        </div>
      )}
    </div>
  );
}
