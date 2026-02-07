
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { NoduleCaseInput, ActionOut, NoduleHandoffContext, ThyroidHistology, PostOpHistology } from '../../types';
import { evaluateThyroidNoduleFlow } from '../../services/noduleFlowAlgorithm';
import { TSHOnlyPanel } from './TSHOnlyPanel';
import { RadionuclideScanPanel } from './RadionuclideScanPanel';
import { USFeaturesForm } from './USFeaturesForm';
import { NodeBiomarkerPanel } from './NodeBiomarkerPanel';
import { CytologyPanel } from './CytologyPanel';
import { PostOpHistologyPanel } from './PostOpHistologyPanel';
import { ActionCard } from './ActionCard';
import { DataSummaryCard } from './DataSummaryCard';

const initialNoduleState: NoduleCaseInput = {
    patient_age: null,
    patient_sex: '',
    TSH: null,
    scan_pattern: 'not_performed',
    scan_concordant: undefined,
    continue_despite_low_tsh: false,
    guideline: 'ATA',
    features: {
        composition: '',
        echogenicity: '',
        margins: '',
        shape: '',
        calcifications: '',
        vascularity: '',
        extrathyroidal_extension: false,
        max_diameter_mm: null,
    },
    node_suspicious: false,
    calcitonin_elevated: false,
    cytology_system: 'Bethesda',
    bethesda_cat: '',
    rcpath_thy: '',
    node_fna_performed: false,
    node_fna_result: '',
    post_op_histology: {
        final_histology: '',
        margin_status: '',
        gross_ETE: false,
        vascular_invasion_vessels: '',
        widely_invasive: false,
        nodes_path_positive: false,
    }
};

interface NoduleStepperProps {
    onBack: () => void;
    onProceedToManagement: (context: NoduleHandoffContext) => void;
}

// Step definitions for dynamic workflow
type StepId = 'tsh' | 'scan' | 'usg' | 'node_biomarker' | 'cytology' | 'post_op';

interface StepConfig {
    id: StepId;
    label: string;
    component: React.FC<{ input: NoduleCaseInput; setInput: (update: Partial<NoduleCaseInput>) => void }>;
}

const ALL_STEPS: StepConfig[] = [
    { id: 'tsh', label: 'Step 1: Serum TSH', component: TSHOnlyPanel },
    { id: 'scan', label: 'Step 2: Radionuclide Scan', component: RadionuclideScanPanel },
    { id: 'usg', label: 'Ultrasound Features', component: USFeaturesForm },
    { id: 'node_biomarker', label: 'Node & Biomarkers', component: NodeBiomarkerPanel },
    { id: 'cytology', label: 'Cytology', component: CytologyPanel },
    { id: 'post_op', label: 'Post-Op Histology', component: PostOpHistologyPanel },
];

export const NoduleStepper: React.FC<NoduleStepperProps> = ({ onBack, onProceedToManagement }) => {
    const [stepIndex, setStepIndex] = useState(0);
    const [input, setInput] = useState<NoduleCaseInput>(initialNoduleState);
    const [showRecommendation, setShowRecommendation] = useState(false);

    // Determine which steps are active based on TSH and other conditions
    const activeSteps = useMemo(() => {
        const steps: StepConfig[] = [];

        // Step 1: TSH is always shown
        steps.push(ALL_STEPS[0]); // tsh

        // Step 2: Radionuclide Scan only if TSH < 0.4
        const isLowTSH = input.TSH !== null && input.TSH < 0.4;
        if (isLowTSH) {
            steps.push(ALL_STEPS[1]); // scan
        }

        // USG and Node/Biomarker are always shown
        steps.push(ALL_STEPS[2]); // usg
        steps.push(ALL_STEPS[3]); // node_biomarker

        // Step 4: Cytology (FNA) Results
        // Only include if FNA is indicated by the algorithm based on USG/Node findings,
        // or if the user has already started entering cytology data.
        const currentResult = evaluateThyroidNoduleFlow(input);
        const fnaIndicated = currentResult.action.includes('FNA');
        const fnaAlreadyEntered = input.bethesda_cat !== '' || input.rcpath_thy !== '' || input.cytology_system !== 'Bethesda'; // If system changed, they probably care about it

        if (fnaIndicated || fnaAlreadyEntered) {
            steps.push(ALL_STEPS[4]); // cytology
        }

        // Post-op only if specifically reached (e.g. after diagnostic surgery recommendation)
        if (input.post_op_histology.final_histology) {
            steps.push(ALL_STEPS[5]); // post_op
        }

        return steps;
    }, [
        input.TSH,
        input.scan_pattern,
        input.scan_concordant,
        input.features,
        input.node_suspicious,
        input.calcitonin_elevated,
        input.bethesda_cat,
        input.rcpath_thy,
        input.cytology_system,
        input.post_op_histology.final_histology
    ]);

    // CRITICAL: Clamp stepIndex if activeSteps shrinks
    useEffect(() => {
        if (stepIndex >= activeSteps.length && activeSteps.length > 0) {
            setStepIndex(activeSteps.length - 1);
        }
    }, [activeSteps.length, stepIndex]);

    const updateInput = useCallback((update: Partial<NoduleCaseInput>) => {
        let newUpdate = { ...update };
        if ('guideline' in update) {
            newUpdate.cytology_system = update.guideline === 'ATA' ? 'Bethesda' : 'RCPath_Thy';
        }
        setInput(prev => ({ ...prev, ...newUpdate }));
        setShowRecommendation(false); // Hide recommendation when input changes
    }, []);

    const handleReset = () => {
        setInput(initialNoduleState);
        setStepIndex(0);
        setShowRecommendation(false);
    };

    const result = useMemo(() => evaluateThyroidNoduleFlow(input), [input]);

    const handleProceed = () => {
        if (!input.features.max_diameter_mm && result.action !== 'TREAT_HYPERTHYROIDISM') return;

        let isNodePositive = input.node_suspicious;
        if (input.node_fna_performed && input.node_fna_result) {
            isNodePositive = input.node_fna_result === 'positive_tg' || input.node_fna_result === 'positive_calcitonin';
        }

        const handoffContext: NoduleHandoffContext = {
            histology: input.calcitonin_elevated || input.node_fna_result === 'positive_calcitonin' ? 'MTC' : 'DTC_papillary',
            size_cm: (input.features.max_diameter_mm || 0) / 10,
            node_positive: isNodePositive,
            calcitonin_elevated: input.calcitonin_elevated || input.node_fna_result === 'positive_calcitonin',
            index_surgery: result.step === 'post_op' ? 'lobectomy' : undefined,
            post_op_histology: result.step === 'post_op' ? input.post_op_histology : undefined
        };
        onProceedToManagement(handoffContext);
    };

    const currentStep = activeSteps[stepIndex];
    const StepComponent = currentStep?.component;

    // Check if all required USG fields are complete
    const isUSGComplete = () => {
        const { features } = input;
        return (
            features.max_diameter_mm !== null &&
            features.composition !== '' &&
            features.echogenicity !== '' &&
            features.margins !== '' &&
            features.shape !== '' &&
            features.calcifications !== ''
        );
    };

    const isNextDisabled = () => {
        if (currentStep?.id === 'tsh' && input.TSH === null) return true;
        if (currentStep?.id === 'scan') {
            // Must select a scan pattern, and if hot nodule/patchy, must answer concordance
            if (input.scan_pattern === 'not_performed') return false; // Allow proceeding without scan
            if ((input.scan_pattern === 'hot_nodule' || input.scan_pattern === 'patchy_mng') && input.scan_concordant === undefined) return true;
        }
        if (currentStep?.id === 'usg' && input.features.max_diameter_mm === null) return true;
        return false;
    };

    const canGoNext = stepIndex < activeSteps.length - 1;
    const isLastStep = stepIndex === activeSteps.length - 1;

    // Check if we can show the "Get Recommendation" button
    const canShowGetRecommendation = isLastStep && (
        (currentStep?.id === 'usg' && isUSGComplete()) ||
        currentStep?.id === 'node_biomarker' ||
        currentStep?.id === 'cytology' ||
        currentStep?.id === 'post_op'
    );

    // Show ActionCard only after user clicks "Get Recommendation"
    const shouldShowActionCard = canShowGetRecommendation && showRecommendation;

    return (
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-4">
                <button onClick={onBack} className="text-sm text-teal-600 hover:text-teal-800 font-medium">‹ Back to Module Selector</button>
            </div>
            <div className={`transition-all duration-500 transform ${showRecommendation ? 'w-full' : 'grid grid-cols-1 lg:grid-cols-2 gap-8'}`}>
                {/* Input Panel - Hidden when showing recommendation */}
                {!showRecommendation && (
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-stone-200 animate-in fade-in slide-in-from-left-4 duration-500">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold text-indigo-800">Thyroid Nodule Evaluation</h2>
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={handleReset}
                                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                                    aria-label="Reset form to initial state"
                                >
                                    Reset Form
                                </button>
                                <div
                                    className="text-sm font-medium text-stone-500"
                                    role="status"
                                    aria-live="polite"
                                >
                                    Step {stepIndex + 1} of {activeSteps.length}
                                </div>
                            </div>
                        </div>

                        {StepComponent && <StepComponent input={input} setInput={updateInput} />}

                        <nav className="mt-8 border-t pt-6 flex justify-between items-center" aria-label="Step navigation">
                            <button
                                onClick={() => setStepIndex(s => Math.max(0, s - 1))}
                                disabled={stepIndex === 0}
                                className="bg-stone-200 text-stone-700 font-bold py-2 px-4 rounded-lg hover:bg-stone-300 disabled:bg-stone-100 disabled:text-stone-400 transition-all"
                                aria-label="Go to previous step"
                            >
                                Back
                            </button>

                            {/* Show Next if not at last step AND not ready for recommendation */}
                            {canGoNext && !canShowGetRecommendation && (
                                <button
                                    onClick={() => setStepIndex(s => s + 1)}
                                    disabled={isNextDisabled()}
                                    className="bg-indigo-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-600 disabled:bg-indigo-200 disabled:cursor-not-allowed transition-all shadow"
                                    aria-label="Go to next step"
                                >
                                    Next
                                </button>
                            )}

                            {/* Show Get Recommendation when data is complete */}
                            {canShowGetRecommendation && (
                                <button
                                    onClick={() => setShowRecommendation(true)}
                                    className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 shadow-lg transition-all flex items-center"
                                >
                                    <span className="mr-2">✨</span> Get Recommendation
                                </button>
                            )}
                        </nav>
                    </div>
                )}

                {/* Results View - Full width when shown */}
                {shouldShowActionCard && (
                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-700 max-w-4xl mx-auto">
                        <div className="flex justify-between items-center mb-2">
                            <button
                                onClick={() => setShowRecommendation(false)}
                                className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center bg-indigo-50 px-4 py-2 rounded-lg transition-colors no-print"
                            >
                                <span className="mr-2">←</span> Edit Entry Data
                            </button>
                            <div className="text-sm text-stone-400 font-medium">Clinical Recommendation Generated</div>
                        </div>

                        <DataSummaryCard input={input} result={result} />
                        <ActionCard
                            result={result}
                            onProceed={handleProceed}
                            onNextStep={() => {
                                const postOpIndex = activeSteps.findIndex(s => s.id === 'post_op');
                                if (postOpIndex >= 0) setStepIndex(postOpIndex);
                            }}
                            onFinish={() => {
                                handleReset();
                                onBack();
                            }}
                            guideline={input.guideline}
                        />
                    </div>
                )}
            </div>
        </main>
    );
};