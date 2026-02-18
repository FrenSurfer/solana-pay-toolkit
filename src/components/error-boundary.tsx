"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="space-y-4 text-center">
              <AlertTriangle
                className="text-destructive mx-auto"
                size={48}
              />
              <h2 className="text-xl font-bold">Something went wrong</h2>
              <p className="text-muted-foreground max-w-md">
                {this.state.error?.message ?? "An unexpected error occurred"}
              </p>
              <Button
                onClick={() => this.setState({ hasError: false })}
                variant="outline"
              >
                Try again
              </Button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
