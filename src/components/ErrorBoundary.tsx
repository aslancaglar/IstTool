"use client";
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);

        // Check if it's a dynamic import error (chunk loading failed)
        const isChunkLoadFailed = error.name === 'ChunkLoadError' ||
            (error.message && error.message.toLowerCase().includes('failed to fetch dynamically imported module'));

        if (isChunkLoadFailed) {
            // Force a hard reload if a chunk fails to load to get the new hashes
            window.location.reload();
        }
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 font-display">Oops, une erreur est survenue !</h2>
                    <p className="text-gray-600 mb-8 max-w-md">
                        L'application a rencontré un problème de chargement. Veuillez rafraîchir la page.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                    >
                        Rafraîchir la page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
