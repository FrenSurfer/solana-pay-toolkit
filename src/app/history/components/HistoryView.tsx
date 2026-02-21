"use client";

import { useEffect, useState, useRef } from "react";
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

const SEARCH_DEBOUNCE_MS = 280;

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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadItems();
  }, [loadItems, filter.type]);

  // Live search: apply filter when typing (debounced); clear immediately when empty
  useEffect(() => {
    const value = searchQuery.trim();
    if (value === "") {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      setFilter({ search: undefined });
      return;
    }
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      setFilter({ search: value });
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, setFilter]);

  const handleSearch = () => {
    setFilter({ search: searchQuery.trim() || undefined });
  };

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

      <div className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <Search
            className="text-muted-foreground absolute left-3 top-1/2 size-[18px] -translate-y-1/2"
            size={18}
          />
          <Input
            placeholder="Search by label, address, message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
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
          title="No QR codes found"
          description="Generate your first QR code to see it here"
          action={{ label: "Generate QR", href: "/generator" }}
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
