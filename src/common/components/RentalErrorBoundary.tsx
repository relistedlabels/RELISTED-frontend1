"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { AlertCircle, X } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
  onError?: (error: Error) => void;
  showAlert?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class RentalErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details
    console.error("Rental Error Boundary caught:", error);
    console.error("Error Info:", errorInfo);

    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const { fallback, showAlert = true } = this.props;

      if (fallback) {
        return fallback(this.state.error, this.handleRetry);
      }

      if (showAlert) {
        return (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <Paragraph1 className="font-semibold text-red-800 mb-1">
                  Something went wrong
                </Paragraph1>
                <Paragraph1 className="text-sm text-red-700 mb-3">
                  {this.state.error.message ||
                    "An unexpected error occurred. Please try again."}
                </Paragraph1>
                <button
                  onClick={this.handleRetry}
                  className="text-sm font-semibold text-red-700 hover:text-red-900 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        );
      }

      return null;
    }

    return this.props.children;
  }
}

// Simple error alert component for non-boundary errors
export const ErrorAlert: React.FC<{
  error: Error | null;
  onDismiss: () => void;
}> = ({ error, onDismiss }) => {
  if (!error) return null;

  return (
    <div className="fixed top-4 right-4 max-w-md bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 z-50 animate-in">
      <div className="flex gap-3">
        <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <Paragraph1 className="font-semibold text-red-800 mb-1">
            Error
          </Paragraph1>
          <Paragraph1 className="text-sm text-red-700">
            {error.message}
          </Paragraph1>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 hover:bg-red-100 rounded transition"
        >
          <X size={18} className="text-red-600" />
        </button>
      </div>
    </div>
  );
};

// Hook for managing error state
export function useRentalError() {
  const [error, setError] = useState<Error | null>(null);

  const clearError = () => setError(null);

  const triggerError = (err: Error | string) => {
    const errorObj = typeof err === "string" ? new Error(err) : err;
    setError(errorObj);
    console.error("Rental Error:", errorObj);
  };

  return { error, triggerError, clearError };
}
