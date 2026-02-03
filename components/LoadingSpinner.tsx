import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    message?: string;
    className?: string;
}

const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    message,
    className = ''
}) => (
    <div className={`flex flex-col items-center justify-center ${className}`} role="status" aria-live="polite">
        <svg
            className={`animate-spin ${sizeClasses[size]} text-teal-600`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
        </svg>
        {message && (
            <p className="mt-2 text-sm text-stone-600">{message}</p>
        )}
        <span className="sr-only">{message || 'Loading...'}</span>
    </div>
);

// Skeleton loader for result cards
export const SkeletonCard: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
    <div className="bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden animate-pulse" role="status" aria-label="Loading content">
        <div className="h-12 bg-stone-200" />
        <div className="p-5 space-y-3">
            {Array.from({ length: lines }).map((_, i) => (
                <div key={i} className="h-4 bg-stone-200 rounded" style={{ width: `${100 - i * 15}%` }} />
            ))}
        </div>
        <span className="sr-only">Loading content...</span>
    </div>
);

// Full-page loading overlay
export const LoadingOverlay: React.FC<{ message?: string }> = ({ message = 'Calculating...' }) => (
    <div
        className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
        role="dialog"
        aria-modal="true"
        aria-label={message}
    >
        <div className="bg-white p-8 rounded-xl shadow-2xl">
            <LoadingSpinner size="lg" message={message} />
        </div>
    </div>
);
