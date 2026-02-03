


import React from 'react';
import { ActionOut, Guideline, NoduleHandoffContext, ThyroidHistology } from '../../types';
import { ClipboardCopyIcon, LightBulbIcon } from '../Icons';

interface ActionCardProps {
    result: ActionOut;
    onProceed: () => void;
    onNextStep: () => void;
    onFinish: () => void;
    guideline: Guideline;
}

const actionLabels: Record<string, string> = {
    NO_FNA_US_FOLLOW_OR_TREAT_HYPERFUNCTION: 'No FNA Recommended',
    TREAT_HYPERTHYROIDISM: 'Proceed to Hyperthyroid Treatment',
    FNA_PRIMARY: 'FNA of Thyroid Nodule',
    FNA_NODE_WITH_WASHOUT: 'FNA of Suspicious Node',
    CONSIDER_FNA_OR_OBSERVE: 'Consider FNA or Observe',
    US_SURVEILLANCE: 'Ultrasound Surveillance',
    REPEAT_US_GUIDED_FNA: 'Repeat Ultrasound-Guided FNA',
    // FIX: Quoted key because it contains a special character '±' and is not a valid identifier.
    'REPEAT_FNA_OR_CNB_±_MOLECULAR': 'Repeat FNA/Core Biopsy ± Molecular Testing',
    MOLECULAR_TESTING: 'Consider Molecular Testing',
    DIAGNOSTIC_LOBECTOMY: 'Diagnostic Lobectomy',
    SURGERY: 'Proceed to Surgery',
    NO_FNA_THERAPEUTIC_ASPIRATION_IF_SYMPTOMATIC: 'No FNA / Consider Aspiration',
    FNA_PRIMARY_ANY_SIZE: 'FNA of Thyroid Nodule',
    NO_FNA_ROUTINE: 'No FNA Routinely Recommended',
    RECOMMEND_COMPLETION_TT: 'Recommend Completion Thyroidectomy',
    SURVEILLANCE_ONLY: 'Surveillance Only',
    AWAITING_INPUTS: 'Awaiting Inputs'
};

export const ActionCard: React.FC<ActionCardProps> = ({ result, onProceed, onNextStep, onFinish, guideline }) => {

    const handleCopySummary = () => {
        const summary = `Recommended Action: ${actionLabels[result.action] || result.action}
Rationale: ${result.why}
${result.interval_months ? `Follow-up Interval: ${result.interval_months} months` : ''}
${result.washout ? `Washout Fluid: ${result.washout}` : ''}
`;
        navigator.clipboard.writeText(summary.trim());
    };

    const isAwaiting = result.action === 'AWAITING_INPUTS';

    // Use deep indigo for ATA (Bethesda) and teal for BTA (Thy system) as requested.
    // Tailwind default colors are used as approximations.
    const headerColor = isAwaiting
        ? 'bg-indigo-600'
        : guideline === 'ATA' ? 'bg-indigo-700' : 'bg-teal-700';


    return (
        <div className="bg-white rounded-xl shadow-lg border border-stone-200 sticky top-24">
            <h3 className={`text-lg font-bold text-white p-4 ${headerColor} rounded-t-xl flex justify-between items-center`}>
                <span>Recommended Next Action</span>
                {!isAwaiting && (
                    <button onClick={handleCopySummary} className="bg-white/20 p-1.5 rounded-full text-white hover:bg-white/30 transition-all" aria-label="Copy Summary">
                        <ClipboardCopyIcon className="w-4 h-4" />
                    </button>
                )}
            </h3>
            <div className="p-5">
                {isAwaiting ? (
                    <div className="text-center text-stone-500 py-4">
                        <LightBulbIcon className="h-8 w-8 mx-auto text-amber-400 mb-2" />
                        <p>{result.why}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {result.assigned_pattern && (
                            <div className="text-sm font-semibold text-indigo-700 bg-indigo-50 p-2 rounded-md text-center">
                                Assigned Pattern: <strong>{result.assigned_pattern}</strong>
                            </div>
                        )}
                        <div>
                            <p className="text-xl font-bold text-indigo-800">{actionLabels[result.action] || result.action}</p>
                            <p className="text-stone-600 mt-1 italic whitespace-pre-wrap">Rationale: {result.why}</p>
                        </div>

                        {(result.interval_months || result.washout) && (
                            <div className="p-3 bg-indigo-50 rounded-md border border-indigo-200">
                                <h4 className="font-semibold text-sm text-indigo-700 mb-1">Details</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm text-indigo-900">
                                    {result.interval_months && <li>Follow-up Interval: <strong>{result.interval_months} months</strong></li>}
                                    {result.washout && <li>Washout Fluid: <strong>{result.washout}</strong></li>}
                                </ul>
                            </div>
                        )}

                        {result.action === 'DIAGNOSTIC_LOBECTOMY' && (
                            <div className="mt-6 border-t pt-6">
                                <button
                                    onClick={onNextStep}
                                    className="w-full bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    Enter Post-Op Histology
                                </button>
                            </div>
                        )}

                        {/* Show Proceed button if available */}
                        {result.proceed_to_management && (
                            <div className="mt-6 border-t pt-6">
                                <button
                                    onClick={onProceed}
                                    className="w-full bg-teal-600 text-white font-bold py-4 px-4 rounded-xl hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-2"
                                >
                                    <span>Proceed to Tumor Management</span>
                                    <span>→</span>
                                </button>
                                <p className="text-[10px] text-center mt-2 text-stone-400 uppercase tracking-widest font-bold">Handoff case data to staging module</p>
                            </div>
                        )}

                        {/* Finish/Reset button - always show as the final exit action */}
                        <div className={`mt-4 ${result.proceed_to_management ? '' : 'border-t pt-6'}`}>
                            <button
                                onClick={onFinish}
                                className={`w-full font-bold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center ${result.proceed_to_management
                                        ? 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                        : 'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg'
                                    }`}
                            >
                                {result.proceed_to_management ? 'Finish & Return Home' : '✓ Finish Evaluation'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};