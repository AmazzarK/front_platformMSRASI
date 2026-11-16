import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'Une erreur inattendue est survenue.',
    };
  }

  render() {
    if (this.state.hasError) {
      let friendly = this.state.errorMessage;
      try {
        const parsed = JSON.parse(this.state.errorMessage);
        if (parsed && parsed.error) {
          friendly = parsed.error;
        }
      } catch {
        // leave raw message
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-surface-container-lowest rounded-xl shadow-xl p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-error-container text-error flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">error_outline</span>
            </div>
            <h1 className="font-headline-md text-on-surface">
              Interruption momentanée du portail
            </h1>
            <p className="font-body-sm text-on-surface-variant leading-relaxed">
              {friendly}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-lg bg-primary text-on-primary font-label-md hover:bg-secondary transition-colors cursor-pointer"
            >
              Recharger le portail MSRASI
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
