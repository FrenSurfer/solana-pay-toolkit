"use client";

import { useToast } from "@/components/ui/toast-provider";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function ToastList() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex min-w-[300px] items-center gap-3 rounded-lg px-4 py-3 shadow-lg",
            toast.variant === "error" &&
              "border border-red-800/50 bg-red-950/50 text-red-200",
            toast.variant === "success" &&
              "border border-green-800/50 bg-green-950/50 text-green-200",
            toast.variant === "warning" &&
              "border border-yellow-800/50 bg-yellow-950/50 text-yellow-200",
            !toast.variant && "border border-border bg-card text-card-foreground"
          )}
        >
          <div className="flex-1">
            {toast.title && (
              <p className="font-medium">{toast.title}</p>
            )}
            {toast.description && (
              <p className="text-sm opacity-90">{toast.description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => dismiss(toast.id)}
            className="opacity-60 hover:opacity-100"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
