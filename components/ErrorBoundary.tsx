import React, { ErrorInfo, ReactNode } from 'react';
import { AlertBanner } from './AlertBanner';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
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
                <div className="p-6 max-w-2xl mx-auto">
                    <AlertBanner
                        type="error"
                        message="Something went wrong. The application has encountered an unexpected error."
                    />
                    <div className="mt-4 p-4 bg-stone-100 rounded-lg text-sm font-mono text-stone-700 whitespace-pre-wrap overflow-auto max-h-64">
                        {this.state.error?.message}
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg"
                    >
                        Reload Application
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
