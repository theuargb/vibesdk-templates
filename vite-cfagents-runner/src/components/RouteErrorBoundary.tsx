import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { useEffect } from 'react';
import { errorReporter } from '@/lib/errorReporter';

export function RouteErrorBoundary() {
  const error = useRouteError();

  useEffect(() => {
    // Report the route error
    if (error) {
      let errorMessage = 'Unknown route error';
      let errorStack = '';

      if (isRouteErrorResponse(error)) {
        errorMessage = `Route Error ${error.status}: ${error.statusText}`;
        if (error.data) {
          errorMessage += ` - ${JSON.stringify(error.data)}`;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
        errorStack = error.stack || '';
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else {
        errorMessage = JSON.stringify(error);
      }

      errorReporter.report({
        message: errorMessage,
        stack: errorStack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        source: 'react-router',
        error: error,
      });
    }
  }, [error]);

  // Render error UI
  if (isRouteErrorResponse(error)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full p-8 bg-card rounded-lg shadow-lg border">
          <h1 className="text-2xl font-bold text-destructive mb-4">
            {error.status} {error.statusText}
          </h1>
          <p className="text-muted-foreground mb-4">
            Sorry, an error occurred while loading this page.
          </p>
          {error.data && (
            <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(error.data, null, 2)}
            </pre>
          )}
          <a
            href="/"
            className="block mt-6 text-center px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
          >
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-8 bg-card rounded-lg shadow-lg border">
        <h1 className="text-2xl font-bold text-destructive mb-4">
          Unexpected Error
        </h1>
        <p className="text-muted-foreground mb-4">
          An unexpected error occurred while loading this page.
        </p>
        {error instanceof Error && (
          <details className="mb-6">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              Error details
            </summary>
            <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-40">
              {error.message}
              {error.stack && '\n\n' + error.stack}
            </pre>
          </details>
        )}
        <a
          href="/"
          className="block text-center px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
        >
          Go to Home
        </a>
      </div>
    </div>
  );
}