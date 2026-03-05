import { useRouteError, Link } from 'react-router-dom';
import { Button } from './ui/button';
import { AlertTriangle, Home, RefreshCcw } from 'lucide-react';

export function ErrorBoundary() {
    const error = useRouteError() as any;
    console.error('Unhandled Route Error:', error);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-red-100 text-center">
                <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
                <p className="text-gray-600 mb-6">
                    We encountered an unexpected error. Don't worry, our team has been notified.
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mb-8 text-left overflow-auto max-h-40">
                    <p className="text-xs font-mono text-red-700">
                        {error?.message || error?.statusText || 'An unknown error occurred'}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        className="flex-1"
                        onClick={() => window.location.reload()}
                    >
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        Try Again
                    </Button>
                    <Link to="/home" className="flex-1">
                        <Button variant="outline" className="w-full">
                            <Home className="h-4 w-4 mr-2" />
                            Go Home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
