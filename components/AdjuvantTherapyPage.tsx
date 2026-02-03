
import React, { useState } from 'react';
import { useThyroidStore } from '../hooks/useThyroidStore';
import { ThyroidAdjuvantPanel } from './ThyroidAdjuvantPanel';
import { TreatmentSummaryCard } from './TreatmentSummaryCard';
import { ResultsPane } from './ResultsPane';
import { ClipboardCopyIcon } from './Icons';

interface AdjuvantTherapyPageProps {
    onBack: () => void;
    onGoBackToStaging: () => void;
}

export const AdjuvantTherapyPage: React.FC<AdjuvantTherapyPageProps> = ({ onBack, onGoBackToStaging }) => {
    const {
        caseInput,
        results,
        errors,
        setCaseInput,
        calculateAdjuvant,
        reset
    } = useThyroidStore();

    const [isCalculated, setIsCalculated] = useState(!!results?.adjuvant);

    const handleCalculate = () => {
        calculateAdjuvant();
        setIsCalculated(true);
    };

    const handleResetAndGoHome = () => {
        reset();
        setIsCalculated(false);
        onBack();
    };

    return (
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex justify-between items-center no-print">
                <div className="flex items-center space-x-4">
                    <button onClick={onBack} className="text-sm text-teal-600 hover:text-teal-800 font-medium flex items-center transition-colors">
                        <span className="mr-1">‹</span> Home
                    </button>
                    <span className="text-stone-300">|</span>
                    <button onClick={onGoBackToStaging} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center transition-colors">
                        <span className="mr-1">‹</span> Back to Staging/Surgery
                    </button>
                </div>
                <div className="flex items-center space-x-4">
                    <button onClick={handleResetAndGoHome} className="text-sm text-teal-600 hover:text-teal-800 font-medium transition-colors">Reset Evaluations</button>
                </div>
            </div>

            <div className="text-center mb-10 no-print">
                <h1 className="text-3xl font-bold text-stone-800">Post-Op Adjuvant Therapy</h1>
                <p className="text-lg text-stone-600 mt-2">Finalize the treatment plan with post-operative pathology data.</p>
            </div>

            <div className={`transition-all duration-500 ${isCalculated ? 'max-w-4xl mx-auto' : 'grid grid-cols-1 lg:grid-cols-2 gap-8'}`}>
                {/* Input Column - Hidden when calculated */}
                {!isCalculated ? (
                    <div className="space-y-6 flex flex-col no-print animate-in fade-in slide-in-from-left-4 duration-500">
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-stone-200">
                            <div className="flex items-center space-x-2 mb-6">
                                <span className="text-2xl">📋</span>
                                <h2 className="text-xl font-bold text-stone-700">Adjuvant Logic Inputs</h2>
                            </div>
                            <ThyroidAdjuvantPanel
                                input={caseInput}
                                setInput={setCaseInput}
                                errors={errors}
                                onCalculate={handleCalculate}
                                result={results?.adjuvant}
                            />
                        </div>

                        {/* Reference Summary (Read-only Staging/Surgery) */}
                        <div className="bg-stone-50 p-5 rounded-xl border border-stone-200">
                            <h3 className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-4">Initial Evaluation Reference</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-stone-500">Histology:</span>
                                    <span className="font-semibold text-stone-800 uppercase">{caseInput.histology?.replace('_', ' ')}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-stone-500">Initial Staging:</span>
                                    <span className="font-semibold text-stone-800">{results?.staging?.T}{results?.staging?.N}{results?.staging?.M} (Stage {results?.staging?.stage})</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-700">
                        <div className="flex justify-between items-center mb-2 no-print">
                            <button
                                onClick={() => setIsCalculated(false)}
                                className="bg-indigo-50 text-indigo-700 font-bold py-3 px-6 rounded-xl hover:bg-indigo-100 transition-all flex items-center shadow-sm"
                            >
                                <span className="mr-2">←</span> Edit Post-Op Data
                            </button>
                            <div className="text-xs font-black text-stone-300 uppercase tracking-widest">Final Adjuvant Strategy Revealed</div>
                        </div>

                        {results && <TreatmentSummaryCard results={results} input={caseInput} onReset={handleResetAndGoHome} />}

                        <div className="no-print">
                            <ResultsPane results={results} isExpertView={true} />
                        </div>
                    </div>
                )}

                {/* Status Column - Only visible when not calculated (placeholders) */}
                {!isCalculated && (
                    <div className="lg:sticky lg:top-24 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        {results && <div className="opacity-50 grayscale pointer-events-none scale-95 blur-[1px]">
                            <TreatmentSummaryCard results={results} input={caseInput} onReset={handleResetAndGoHome} />
                        </div>}

                        <div className="bg-white p-10 rounded-xl shadow border border-stone-100 flex flex-col items-center justify-center text-center space-y-4 border-dashed no-print">
                            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl grayscale opacity-50">📋</span>
                            </div>
                            <h3 className="text-lg font-bold text-stone-400">Final Summary Waiting</h3>
                            <p className="text-stone-400 max-w-xs text-sm">Enter post-operative data and calculate adjuvant therapy to see the complete treatment summary card.</p>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
};
