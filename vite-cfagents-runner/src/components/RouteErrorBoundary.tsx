import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { useEffect } from 'react';
import { errorReporter } from '@/lib/errorReporter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-destructive">
              {error.status} {error.statusText}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Sorry, an error occurred while loading this page.
            </p>
            {error.data && (
              <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(error.data, null, 2)}
              </pre>
            )}
            <Button asChild className="w-full">
              <a href="/">Go to Home</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-destructive">
            Unexpected Error
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            An unexpected error occurred while loading this page.
          </p>
          {error instanceof Error && (
            <details>
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                Error details
              </summary>
              <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                {error.message}
                {error.stack && '\n\n' + error.stack}
              </pre>
            </details>
          )}
          <Button asChild className="w-full">
            <a href="/">Go to Home</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}