import React from 'react';
import { Results, TreatmentRecommendation } from '../types';
import { ClipboardCopyIcon, LightBulbIcon } from './Icons';

interface OutputCardProps {
    title: string;
    children: React.ReactNode;
    colorClass?: string;
    isCollapsible?: boolean;
}

const OutputCard: React.FC<OutputCardProps> = ({ title, children, colorClass = 'bg-teal-600', isCollapsible = false }) => {
    const cardContent = (
        <>
            <h3 className={`text-lg font-bold text-white p-4 ${colorClass} ${isCollapsible ? '' : 'rounded-t-xl'}`}>
                {title}
            </h3>
            <div className="p-5 space-y-4">
                {children}
            </div>
        </>
    );

    if (isCollapsible) {
        return (
            <details className="bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden mb-6 open:ring-2 open:ring-teal-500">
                <summary className={`text-lg font-bold text-white p-4 ${colorClass} cursor-pointer list-none flex justify-between items-center`}>
                    <span>{title}</span>
                    <span className="text-xs font-normal opacity-80 group-open:hidden">(Click to expand)</span>
                </summary>
                <div className="p-5 space-y-4">
                    {children}
                </div>
            </details>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden mb-6">
            {cardContent}
        </div>
    );
};

const StagingPill: React.FC<{ label: string, value: string, reason: string }> = ({ label, value, reason }) => (
    <div>
        <div className="flex items-baseline space-x-2">
            <span className="font-semibold text-stone-500 w-8">{label}:</span>
            <span className="text-2xl font-bold text-teal-700">{value}</span>
        </div>
        <p className="text-sm text-stone-500 ml-10 italic">Rationale: {reason}</p>
    </div>
);

const TreatmentCardContent: React.FC<{ recommendation: TreatmentRecommendation }> = ({ recommendation }) => (
    <div className="space-y-3">
        <p className="text-lg font-semibold text-teal-800">{recommendation.label}</p>
        <div>
            <h4 className="font-semibold text-sm text-stone-600">Clinical Rationale</h4>
            <p className="text-stone-600 text-sm italic">{recommendation.rationale}</p>
        </div>
        {recommendation.indications.length > 0 && (
            <div>
                <h4 className="font-semibold text-sm text-stone-600">Indications in this Case</h4>
                <ul className="list-disc list-inside text-sm text-stone-600 space-y-1 mt-1">
                    {recommendation.indications.map((reason, i) => <li key={i}>{reason}</li>)}
                </ul>
            </div>
        )}
    </div>
);

interface ResultsPaneProps {
    results: Results | null;
    showStaging?: boolean;
    showTreatment?: boolean;
    isExpertView?: boolean;
}

export const ResultsPane: React.FC<ResultsPaneProps> = ({ results, showStaging = true, showTreatment = true, isExpertView = false }) => {

    const formatTxForCopy = (tx?: TreatmentRecommendation) => {
        if (!tx) return 'N/A';
        return `${tx.label}. Rationale: ${tx.rationale}. Indications: ${tx.indications.join(', ')}.`;
    };

    const handleCopySummary = () => {
        if (!results) return;
        const summary = `Staging: ${results.staging.T}${results.staging.N}${results.staging.M} (Stage ${results.staging.stage}).
Thyroid Surgery: ${formatTxForCopy(results.treatment.thyroidSurgery)}.
Neck Surgery: ${formatTxForCopy(results.treatment.neckSurgery)}.
`;
        navigator.clipboard.writeText(summary.trim());
    };

    if (!results) {
        return (
            <div className="bg-white p-8 rounded-xl shadow-lg border border-stone-200 text-center">
                <LightBulbIcon className="h-12 w-12 mx-auto text-amber-400 mb-4" />
                <h3 className="text-xl font-semibold text-stone-700">Awaiting Calculation</h3>
                <p className="text-stone-500 mt-2">Please fill in the patient data on the left and click "Calculate" to see the results here.</p>
            </div>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={handleCopySummary}
                className="absolute top-4 right-4 bg-white p-2 rounded-full text-stone-500 hover:text-teal-600 hover:bg-stone-100 transition-all shadow z-10"
                aria-label="Copy summary to clipboard"
                title="Copy summary to clipboard"
            >
                <ClipboardCopyIcon className="w-5 h-5" aria-hidden="true" />
            </button>

            {/* Redundant separate cards have been moved to the TreatmentSummaryCard collapsible section for better UX */}
            <div className="text-center py-6 text-stone-400 text-xs italic uppercase tracking-widest no-print">
                Detailed rationale consolidated in summary above
            </div>
        </div>
    );
};