import React, { Component, ErrorInfo, ReactNode } from 'react';
import { errorReporter } from '@/lib/errorReporter';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo, retry: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Update state with error info
    this.setState({ errorInfo });

    // Report error to backend
    errorReporter.report({
      message: error.message,
      stack: error.stack || '',
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
      errorBoundaryProps: {
        componentName: this.constructor.name,
      },
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });
  }

  private retry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // Reload the page to ensure clean state
    window.location.reload();
  };

  private goHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(
          this.state.error,
          this.state.errorInfo!,
          this.retry
        );
      }

      // Beautiful default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="w-full max-w-md">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-rainbow opacity-5 dark:opacity-10" />
            
            {/* Error card */}
            <div className="relative bg-card/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-border/50 p-8 space-y-6">
              {/* Icon and title */}
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                </div>
                <h1 className="text-2xl font-bold">Oops! Something went wrong</h1>
                <p className="text-muted-foreground">
                  We&apos;re aware of the issue and actively working to fix it. 
                  Your experience matters to us.
                </p>
              </div>

              {/* Status indicator */}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <span>Our team has been notified</span>
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                <button
                  onClick={this.retry}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 font-medium"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
                <button
                  onClick={this.goHome}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-all duration-200"
                >
                  <Home className="w-4 h-4" />
                  Go to Homepage
                </button>
              </div>

              {/* Error details (collapsible) */}
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Error details (Development only)
                  </summary>
                  <pre className="mt-3 text-xs overflow-auto max-h-40 text-muted-foreground">
                    {this.state.error.message}
                    {this.state.error.stack && '\n\n' + this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>

            {/* Support text */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              If this problem persists, please contact our support team
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}