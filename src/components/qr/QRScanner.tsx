"use client";

import { useCallback, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import jsQR from "jsqr";
import { cn } from "@/lib/utils";

interface QRScannerProps {
  onScan: (content: string) => void;
  className?: string;
}

export function QRScanner({ onScan, className }: QRScannerProps) {
  const [dragActive, setDragActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processImage = useCallback(
    async (file: File) => {
      setScanning(true);
      try {
        const bitmap = await createImageBitmap(file);
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(bitmap, 0, 0);

        const imageData = ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );
        const code = jsQR(imageData.data, canvas.width, canvas.height);

        if (code) {
          onScan(code.data);
        } else {
          alert("No QR code found in image");
        }
      } finally {
        setScanning(false);
      }
    },
    [onScan]
  );

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      void processImage(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      void processImage(e.target.files[0]);
    }
    e.target.value = "";
  };

  return (
    <div className={className}>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors",
          dragActive
            ? "border-solana-purple bg-solana-purple/10"
            : "border-muted-foreground/30 hover:border-muted-foreground/50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />

        <Upload className="text-muted-foreground mx-auto mb-4 size-12" />

        <p className="text-sm font-medium">
          {scanning
            ? "Scanning..."
            : "Drop QR image here or click to upload"}
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          Supports PNG, JPG, WEBP
        </p>
      </div>
    </div>
  );
}
