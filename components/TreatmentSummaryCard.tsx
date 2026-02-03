import React, { useState } from 'react';
import { Results, CaseInput } from '../types';
import { ClipboardCopyIcon } from './Icons';

interface TreatmentSummaryCardProps {
    results: Results | null;
    input: CaseInput;
    onReset: () => void;
}

export const TreatmentSummaryCard: React.FC<TreatmentSummaryCardProps> = ({ results, input, onReset }) => {
    const [isRationaleOpen, setIsRationaleOpen] = useState(false);

    if (!results) return null;

    const { staging, treatment, adjuvant } = results;

    const handlePrint = () => {
        window.print();
    };

    const handleCopy = () => {
        const isRiaRecommended = adjuvant && !adjuvant.plan.toLowerCase().includes('not indicated');
        const riaStatus = adjuvant ? (isRiaRecommended ? 'Recommended' : 'Not Recommended') : 'Pending';
        const summary = `
Thyroid Cancer Case Summary: ${staging.T}${staging.N}${staging.M} Stage ${staging.stage}
Recommendation: ${treatment.thyroidSurgery?.label || 'Total Thyroidectomy'} ${treatment.neckSurgery ? `+ ${treatment.neckSurgery.label}` : ''} (Adjuvant RIA: ${riaStatus})
`.trim();
        navigator.clipboard.writeText(summary);
    };

    const isRiaRecommended = adjuvant && !adjuvant.plan.toLowerCase().includes('not indicated');
    const riaLabel = adjuvant ? (isRiaRecommended ? 'Recommended' : 'Not Recommended') : 'Pending';

    // Styling for RIA box based on status
    let riaColor = 'text-blue-700 bg-blue-50 border-blue-200'; // Default Pending
    if (adjuvant) {
        riaColor = isRiaRecommended
            ? 'text-teal-700 bg-teal-50 border-teal-200'
            : 'text-stone-500 bg-stone-50 border-stone-200';
    }

    return (
        <div className="bg-white rounded-xl shadow-xl border-2 border-teal-500 overflow-hidden mb-8 transition-all duration-300">
            <div className="bg-teal-500 p-4 flex justify-between items-center text-white">
                <div className="flex items-center space-x-2">
                    <span className="text-xl">📋</span>
                    <h3 className="text-lg font-bold uppercase tracking-wider">Consolidated Recommendation</h3>
                </div>
                <div className="flex items-center space-x-2 no-print">
                    <button
                        onClick={handlePrint}
                        className="p-1.5 hover:bg-teal-600 rounded-lg transition-colors"
                        title="Save as PDF"
                    >
                        <span className="text-sm mr-1">📄</span> PDF
                    </button>
                    <button
                        onClick={handleCopy}
                        className="p-1.5 hover:bg-teal-600 rounded-lg transition-colors"
                        title="Copy Summary To Clipboard"
                    >
                        <ClipboardCopyIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Headline Section */}
                <div className="space-y-1">
                    <div className="text-sm font-semibold text-stone-500 uppercase tracking-widest">Final Stage & Classification</div>
                    <div className="text-2xl font-black text-stone-800 flex items-center flex-wrap">
                        <span className="mr-2">{staging.T}{staging.N}{staging.M}</span>
                        <span className="text-teal-600">Stage {staging.stage}</span>
                        {input.patient?.age_years && (
                            <span className="text-stone-400 font-normal text-lg ml-3 italic">Age {input.patient.age_years}y</span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Surgery Details */}
                    <div className="space-y-4">
                        <div className="bg-stone-50 p-3 rounded-lg border border-stone-100">
                            <div className="text-xs font-bold text-stone-400 uppercase mb-1">Thyroid Surgery</div>
                            <div className="text-lg font-bold text-stone-700">
                                {treatment.thyroidSurgery?.label || 'None Recommended'}
                            </div>
                        </div>
                        <div className="bg-stone-50 p-3 rounded-lg border border-stone-100">
                            <div className="text-xs font-bold text-stone-400 uppercase mb-1">Neck Management</div>
                            <div className="text-lg font-bold text-stone-700">
                                {treatment.neckSurgery?.label || 'No Dissection Indicated'}
                            </div>
                        </div>
                    </div>

                    {/* RIA Status Box */}
                    <div className={`p-5 rounded-2xl border-2 flex flex-col justify-center items-center text-center transition-all shadow-inner ${riaColor}`}>
                        <div className="text-xs font-bold uppercase mb-2 opacity-70 tracking-tighter">Radioiodine Ablation (RIA)</div>
                        <div className="text-2xl font-black flex items-center justify-center">
                            {riaLabel === 'Pending' && <span className="mr-2 animate-pulse text-3xl">⏳</span>}
                            {riaLabel === 'Recommended' && <span className="mr-2 text-green-600 text-3xl">✓</span>}
                            {riaLabel === 'Not Recommended' && <span className="mr-2 text-stone-400 text-3xl">✗</span>}
                            <span className="whitespace-nowrap">{riaLabel}</span>
                        </div>
                        {adjuvant && isRiaRecommended && (
                            <div className="text-sm font-semibold mt-2 opacity-90 leading-tight">
                                {adjuvant.plan}
                            </div>
                        )}
                        {!adjuvant && (
                            <div className="text-xs font-medium mt-2 opacity-60">
                                Awaiting post-op data entry
                            </div>
                        )}
                    </div>
                </div>

                {/* Collapsible Rationale */}
                <div className="border-t border-stone-100 pt-4">
                    <button
                        onClick={() => setIsRationaleOpen(!isRationaleOpen)}
                        className="group flex items-center w-full text-left"
                    >
                        <div className="flex-1 text-sm font-bold text-teal-700 group-hover:text-teal-800 transition-colors uppercase tracking-widest flex items-center">
                            <span className={`inline-block w-4 transition-transform duration-200 ${isRationaleOpen ? 'rotate-90' : 'rotate-0'}`}>▶</span>
                            <span>Clinical Rationale & Staging Basis</span>
                        </div>
                        <span className="text-xs text-stone-400 font-normal">{isRationaleOpen ? 'Hide Details' : 'View Details'}</span>
                    </button>

                    {isRationaleOpen && (
                        <div className="mt-4 bg-stone-50 rounded-xl p-5 space-y-5 text-stone-700 border border-stone-100 animate-in fade-in slide-in-from-top-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-xs font-bold text-stone-400 uppercase mb-3 border-b border-stone-200 pb-1">TNM Basis</h4>
                                    <ul className="text-sm space-y-2">
                                        <li className="flex items-start"><span className="text-teal-500 mr-2">•</span>{staging.T_why}</li>
                                        <li className="flex items-start"><span className="text-teal-500 mr-2">•</span>{staging.N_why}</li>
                                        <li className="flex items-start"><span className="text-teal-500 mr-2">•</span>{staging.stage_why}</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-stone-400 uppercase mb-3 border-b border-stone-200 pb-1">Indications</h4>
                                    <ul className="text-sm space-y-2">
                                        {[...(treatment.thyroidSurgery?.indications || []), ...(treatment.neckSurgery?.indications || [])].map((ind, i) => (
                                            <li key={i} className="flex items-start"><span className="text-teal-500 mr-2">•</span>{ind}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-stone-100 pt-5">
                                {treatment.thyroidSurgery && (
                                    <div>
                                        <h4 className="text-xs font-black text-stone-400 uppercase mb-2 tracking-tight">Thyroid Surgery Basis</h4>
                                        <p className="text-sm italic leading-relaxed text-stone-600">{treatment.thyroidSurgery.rationale}</p>
                                    </div>
                                )}
                                {treatment.neckSurgery && (
                                    <div>
                                        <h4 className="text-xs font-black text-stone-400 uppercase mb-2 tracking-tight">Neck Management Basis</h4>
                                        <p className="text-sm italic leading-relaxed text-stone-600">{treatment.neckSurgery.rationale}</p>
                                    </div>
                                )}
                            </div>
                            {adjuvant && (
                                <div className="border-t border-stone-200 pt-3 mt-2">
                                    <h4 className="text-xs font-bold text-stone-400 uppercase mb-1">Adjuvant Recommendation Details</h4>
                                    <p className="text-sm italic text-stone-600">{adjuvant.explain}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="pt-4 border-t border-stone-100 no-print">
                    <button
                        onClick={onReset}
                        className="w-full bg-stone-900 text-white font-bold py-4 px-6 rounded-2xl hover:bg-black transition-all transform active:scale-95 flex items-center justify-center shadow-lg"
                    >
                        <span className="mr-3 text-xl">✓</span> Complete & Reset Evaluation
                    </button>
                    <p className="text-center text-[10px] text-stone-400 mt-3 uppercase tracking-widest font-medium">Final clinical summary based on AJCC 8 / NCCN / ATA guidelines</p>
                </div>
            </div>
        </div>
    );
};
