
import React from 'react';

interface BaseProps {
    label: string;
    error?: string;
    className?: string;
}

interface InputFieldProps extends BaseProps, React.InputHTMLAttributes<HTMLInputElement> {}
export const InputField: React.FC<InputFieldProps> = ({ label, error, className, ...props }) => (
    <div className={className}>
        <label className="block text-sm font-medium text-stone-600 mb-1">{label}</label>
        <input 
            {...props}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 bg-stone-100 transition ${error ? 'border-red-500 focus:ring-red-500' : 'border-stone-300 focus:border-teal-500 focus:ring-teal-500'}`}
        />
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
);

interface SelectFieldProps extends BaseProps, React.SelectHTMLAttributes<HTMLSelectElement> {
    options: { value: string; label: string }[];
}
export const SelectField: React.FC<SelectFieldProps> = ({ label, error, options, className, ...props }) => (
     <div className={className}>
        <label className="block text-sm font-medium text-stone-600 mb-1">{label}</label>
        <select
            {...props}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 bg-stone-100 transition ${error ? 'border-red-500 focus:ring-red-500' : 'border-stone-300 focus:border-teal-500 focus:ring-teal-500'}`}
        >
            <option value="">Select...</option>
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
);

interface CheckboxFieldProps extends BaseProps, React.InputHTMLAttributes<HTMLInputElement> {}
export const CheckboxField: React.FC<CheckboxFieldProps> = ({ label, error, className, ...props }) => (
    <div className={`flex items-center ${className}`}>
        <input 
            type="checkbox"
            {...props}
            id={label}
            className="h-4 w-4 text-teal-600 border-stone-300 rounded focus:ring-teal-500"
        />
        <label htmlFor={label} className="ml-2 block text-sm text-stone-700">{label}</label>
        {error && <p className="text-xs text-red-600 mt-1 ml-2">{error}</p>}
    </div>
);
