import React, { useState, useEffect } from 'react';
import { CaseInput, ThyroidHistology, NoduleHandoffContext } from '../types';
import { useThyroidStore } from '../hooks/useThyroidStore';
import { ThyroidInputPane } from './ThyroidInputPane';
import { ResultsPane } from './ResultsPane';
import { AlertBanner } from './AlertBanner';
import { TreatmentSummaryCard } from './TreatmentSummaryCard';

const initialCaseState: CaseInput = {
    family: 'Thyroid',
    context: 'clinical',
};

interface ThyroidCancerManagerProps {
    initialContext?: NoduleHandoffContext | null;
    onBack: () => void;
    onProceedToAdjuvant: () => void;
}

export const ThyroidCancerManager: React.FC<ThyroidCancerManagerProps> = ({ initialContext, onBack, onProceedToAdjuvant }) => {
    const [mode, setMode] = useState<'expert' | 'guided'>('expert');
    const [step, setStep] = useState(1);
    const [isShowingResults, setIsShowingResults] = useState(false);

    // Zustand Store Integration
    const {
        caseInput,
        results,
        errors,
        showMdtBanner,
        setCaseInput,
        calculate,
        reset
    } = useThyroidStore();

    useEffect(() => {
        if (initialContext) {
            const newCaseInput: Partial<CaseInput> = {
                ...initialCaseState,
                histology: initialContext.histology,
                primary: {
                    size_cm: { value: initialContext.size_cm }
                },
                nodes: {
                    levels: {
                        lateral_neck_or_retropharyngeal: initialContext.node_positive
                    }
                },
                biomarkers: {
                    calcitonin_pg_ml: initialContext.calcitonin_elevated ? 101 : undefined
                }
            };

            if (initialContext.index_surgery && initialContext.post_op_histology) {
                const histologyMap: Record<string, ThyroidHistology> = {
                    "PTC": "DTC_papillary", "FTC": "DTC_follicular", "Oncocytic": "DTC_oncocytic",
                    "NIFTP": "DTC_follicular", "Poorly-differentiated": "DTC_papillary"
                };
                newCaseInput.histology = histologyMap[initialContext.post_op_histology.final_histology] || 'DTC_papillary';
                newCaseInput.index_surgery = initialContext.index_surgery;
                newCaseInput.largest_focus_cm = initialContext.size_cm;
                newCaseInput.margin_status = initialContext.post_op_histology.margin_status || undefined;
                newCaseInput.gross_ETE = initialContext.post_op_histology.gross_ETE;
                newCaseInput.vascular_invasion = ['1-3', '>=4'].includes(initialContext.post_op_histology.vascular_invasion_vessels);
                newCaseInput.nodes_positive_count = initialContext.post_op_histology.nodes_path_positive ? 1 : 0;
                newCaseInput.prior_surgery_summary = {
                    surgery: `Initial Surgery: ${initialContext.index_surgery === 'lobectomy' ? 'Lobectomy' : 'Total Thyroidectomy'}`,
                    details: [
                        `Final Histology: ${initialContext.post_op_histology.final_histology}`,
                        `Margins: ${initialContext.post_op_histology.margin_status}`,
                        `Gross ETE: ${initialContext.post_op_histology.gross_ETE ? 'Present' : 'Absent'}`,
                        `Vascular Invasion: ${initialContext.post_op_histology.vascular_invasion_vessels || 'none'}`
                    ]
                };
            }
            setCaseInput(newCaseInput as CaseInput);
        }
    }, [initialContext, setCaseInput]);

    const handleReset = () => {
        reset();
        setStep(1);
        setIsShowingResults(false);
    };

    const handleResetAndGoHome = () => {
        reset();
        setStep(1);
        setIsShowingResults(false);
        onBack();
    };

    const handleCalculate = () => {
        calculate();
        setIsShowingResults(true);
        if (step === 1) setStep(2); // Only advance step if coming from the input pane in guided mode
    };

    // --- Guided Mode Logic ---
    const handleNext = () => {
        if (step === 1) { // From Inputs to Staging
            handleCalculate();
        } else if (step < 3) {
            setStep(s => s + 1);
        }
    };

    const handleBack = () => {
        if (step === 2) {
            setIsShowingResults(false);
        }
        setStep(s => s - 1);
    };

    const renderGuidedView = () => (
        <div className="max-w-4xl mx-auto transition-all duration-500">
            {step === 1 ? (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-stone-200 animate-in fade-in slide-in-from-left-4 duration-500">
                    <h2 className="text-2xl font-semibold text-teal-800 mb-6 border-b pb-2">Step 1: Patient & Tumor Inputs</h2>
                    <ThyroidInputPane input={caseInput} setInput={setCaseInput} errors={errors} />
                    <div className="mt-8 border-t pt-6 flex justify-end">
                        <button onClick={handleCalculate} className="bg-teal-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-teal-700 shadow-lg transition-all transform active:scale-95 flex items-center">
                            Calculate Staging & Treatment <span className="ml-2">→</span>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
                    <div className="flex justify-between items-center mb-2 no-print">
                        <button
                            onClick={() => { setStep(1); setIsShowingResults(false); }}
                            className="bg-stone-100 text-stone-600 font-bold py-2 px-4 rounded-lg hover:bg-stone-200 transition-all flex items-center"
                        >
                            <span className="mr-2">←</span> Edit Inputs
                        </button>
                        <div className="flex items-center space-x-2">
                            <div className="text-sm font-medium text-stone-500">
                                {step === 2 ? 'Staging Results' : 'Treatment Results'}
                            </div>
                            <button
                                onClick={handleNext}
                                disabled={step === 3}
                                className={`text-sm font-bold py-2 px-4 rounded-lg transition-all ${step === 3 ? 'bg-stone-50 text-stone-300' : 'bg-teal-50 text-teal-700 hover:bg-teal-100'}`}
                            >
                                {step === 2 ? 'View Treatment Plan →' : 'Treatment Plan Revealed'}
                            </button>
                        </div>
                    </div>

                    {showMdtBanner && <AlertBanner message="Complex case: MDT review is strongly recommended." type="warning" />}

                    {step === 2 && (
                        <div className="space-y-6">
                            <ResultsPane results={results} showStaging={true} showTreatment={false} />
                            <div className="bg-white p-6 rounded-xl border-2 border-dashed border-stone-200 text-center">
                                <p className="text-stone-500 mb-4">Staging determined. Ready to see the surgical recommendations?</p>
                                <button onClick={handleNext} className="bg-teal-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-teal-700 shadow-lg">Show Treatment Plan</button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <TreatmentSummaryCard results={results} input={caseInput} onReset={handleResetAndGoHome} />
                            <ResultsPane results={results} showStaging={false} showTreatment={true} />

                            <div className="pt-4 border-t mt-6">
                                <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold mb-3 text-center">Next Implementation Phase</p>
                                <button
                                    onClick={onProceedToAdjuvant}
                                    className="w-full bg-indigo-600 text-white font-bold py-4 px-6 rounded-2xl hover:bg-indigo-700 transition-all transform hover:scale-[1.01] flex items-center justify-center shadow-lg border-2 border-indigo-100"
                                >
                                    <span className="mr-3 text-xl">📋</span> Proceed to Post-Op Adjuvant Plan
                                </button>
                                <p className="text-center text-[10px] text-stone-400 mt-3 px-8 uppercase leading-tight font-medium">Use this module after surgical pathology is available to determine RAI requirements.</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    const renderExpertView = () => (
        <div className="max-w-5xl mx-auto transition-all duration-500">
            {!isShowingResults ? (
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-stone-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center mb-8 border-b pb-4">
                        <h2 className="text-3xl font-bold text-teal-800">Thyroid Cancer Evaluation</h2>
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest bg-stone-100 px-3 py-1 rounded-full">Expert Mode</span>
                    </div>
                    <ThyroidInputPane input={caseInput} setInput={setCaseInput} errors={errors} />
                    <div className="mt-10 border-t pt-8">
                        <button
                            onClick={handleCalculate}
                            className="w-full bg-teal-600 text-white font-black py-5 px-6 rounded-2xl hover:bg-teal-700 shadow-xl transition-all transform hover:scale-[1.01] active:scale-95 text-lg flex items-center justify-center group"
                        >
                            Calculate Staging & Treatment Recommendations
                            <span className="ml-3 group-hover:translate-x-2 transition-transform">🚀</span>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
                    <div className="flex justify-between items-center no-print">
                        <button
                            onClick={() => setIsShowingResults(false)}
                            className="bg-white text-teal-700 font-bold py-3 px-6 rounded-xl hover:bg-stone-50 border border-teal-200 shadow-sm transition-all flex items-center"
                        >
                            <span className="mr-2">←</span> Edit Entry Data
                        </button>
                        <div className="text-sm font-bold text-stone-400 uppercase tracking-tighter">Evaluation Results Complete</div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        <div className="lg:col-span-12">
                            {showMdtBanner && <AlertBanner message="Complex case: MDT review is strongly recommended." type="warning" />}
                            {results && <TreatmentSummaryCard results={results} input={caseInput} onReset={handleResetAndGoHome} />}
                        </div>

                        <div className="lg:col-span-12">
                            <ResultsPane results={results} isExpertView={true} />
                        </div>

                        {results && (
                            <div className="lg:col-span-12 pt-6 border-t mt-4">
                                <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold mb-3 text-center">Next Implementation Phase</p>
                                <button
                                    onClick={onProceedToAdjuvant}
                                    className="w-full bg-indigo-600 text-white font-bold py-5 px-6 rounded-2xl hover:bg-indigo-700 transition-all transform hover:scale-[1.01] flex items-center justify-center shadow-xl border-2 border-indigo-100"
                                >
                                    <span className="mr-3 text-2xl">📋</span> Proceed to Post-Op Adjuvant Plan
                                </button>
                                <p className="text-center text-[10px] text-stone-400 mt-3 px-8 uppercase leading-tight font-medium max-w-lg mx-auto">This module calculates Radioiodine (RAI) requirements and adjuvant strategy based on surgical pathology findings.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex justify-between items-center">
                <button onClick={onBack} className="text-sm text-teal-600 hover:text-teal-800 font-medium">‹ Back to Module Selector</button>
                <div className="flex items-center space-x-2">
                    <div className="p-1 bg-stone-200 rounded-lg flex items-center space-x-1">
                        <button onClick={() => setMode('expert')} className={`px-3 py-1 text-sm rounded-md ${mode === 'expert' ? 'bg-white text-teal-700 shadow' : 'bg-transparent text-stone-600'}`}>Expert View</button>
                        <button onClick={() => setMode('guided')} className={`px-3 py-1 text-sm rounded-md ${mode === 'guided' ? 'bg-white text-teal-700 shadow' : 'bg-transparent text-stone-600'}`}>Guided View</button>
                    </div>
                    <button onClick={handleReset} className="text-sm text-teal-600 hover:text-teal-800 font-medium">Reset Form</button>
                </div>
            </div>
            {mode === 'expert' ? renderExpertView() : renderGuidedView()}
        </main>
    );
};