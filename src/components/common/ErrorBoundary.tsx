import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--sys-surface)] p-6 text-[var(--sys-on-surface)]">
          <div className="w-full max-w-md rounded-2xl border border-[var(--sys-error)]/20 bg-[var(--sys-surface)] p-8 shadow-xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--sys-error)]/10 text-[var(--sys-error)]">
              <AlertOctagon className="h-8 w-8" />
            </div>

            <h1 className="mt-6 text-2xl font-bold tracking-tight">Something went wrong</h1>
            <p className="mt-2 text-sm text-[var(--sys-on-surface-variant)]">
              An unexpected error occurred. Do not worry, our team has been notified.
            </p>

            {this.state.error && (
              <div className="mt-4 overflow-x-auto rounded-lg bg-[var(--sys-surface-variant)] p-3 text-left text-xs font-mono text-[var(--sys-on-surface-variant)] max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 rounded-xl bg-[var(--sys-primary)] px-5 py-2.5 text-sm font-semibold text-[var(--sys-on-primary)] hover:opacity-95 transition-opacity"
              >
                <RotateCcw className="h-4 w-4" />
                Retry App
              </button>
              <a
                href="/"
                className="flex items-center justify-center gap-2 rounded-xl border border-[var(--sys-outline)] bg-[var(--sys-surface)] px-5 py-2.5 text-sm font-semibold hover:bg-[var(--sys-surface-variant)] hover:text-[var(--sys-on-surface)] transition-all"
              >
                <Home className="h-4 w-4" />
                Go Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
