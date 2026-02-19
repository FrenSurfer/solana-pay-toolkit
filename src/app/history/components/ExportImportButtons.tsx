"use client";

import { useState, useRef } from "react";
import { exportHistory, importHistory } from "@/lib/db/history";
import { useHistoryStore } from "@/stores/historyStore";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";

export function ExportImportButtons({
  disabled = false,
}: { disabled?: boolean } = {}) {
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadItems = useHistoryStore((s) => s.loadItems);

  const handleExport = async () => {
    try {
      const json = await exportHistory();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `solana-pay-history-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(
        "Export failed: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const result = await importHistory(text);
      alert(
        `Imported ${result.imported} items${result.errors > 0 ? `, ${result.errors} errors` : ""}`
      );
      await loadItems();
    } catch (err) {
      alert(
        "Import failed: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={handleExport}
        type="button"
        disabled={disabled}
      >
        <Download size={16} className="mr-2" />
        Export
      </Button>
      <Button
        variant="outline"
        onClick={handleImportClick}
        disabled={disabled || importing}
        type="button"
      >
        <Upload size={16} className="mr-2" />
        {importing ? "Importing..." : "Import"}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileSelect}
        className="hidden"
        aria-hidden
      />
    </div>
  );
}
