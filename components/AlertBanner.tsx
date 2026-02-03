
import React from 'react';
import { AlertTriangleIcon } from './Icons';

interface AlertBannerProps {
    message: string;
    type: 'warning' | 'info' | 'error';
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ message, type }) => {
    const baseClasses = "flex items-center p-4 mb-4 text-sm rounded-lg";
    const typeClasses = {
        warning: "bg-amber-100 text-amber-800",
        info: "bg-teal-100 text-teal-800",
        error: "bg-red-100 text-red-800"
    };

    return (
        <div className={`${baseClasses} ${typeClasses[type]}`} role="alert">
            <AlertTriangleIcon className="flex-shrink-0 inline w-5 h-5 mr-3" />
            <span className="font-medium">{message}</span>
        </div>
    );
};
