import { create } from 'zustand';
import { CaseInput, Results, StagingOutput, TreatmentOutput } from '../types';
import { StagingEngine } from '../services/stagingEngine';
import { TreatmentEngine } from '../services/treatmentEngine';
import { evaluateThyroidAdjuvant } from '../services/thyroidAdjuvantService';

interface ThyroidStore {
    caseInput: CaseInput;
    results: Results | null;
    errors: Record<string, string>;
    showMdtBanner: boolean;

    // Actions
    setCaseInput: (update: Partial<CaseInput>) => void;
    setErrors: (errors: Record<string, string>) => void;
    calculate: () => void;
    calculateAdjuvant: () => void;
    reset: () => void;
    setShowMdtBanner: (show: boolean) => void;
}

const initialCaseState: CaseInput = {
    family: 'Thyroid',
    context: 'clinical',
};

export const useThyroidStore = create<ThyroidStore>((set, get) => ({
    caseInput: initialCaseState,
    results: null,
    errors: {},
    showMdtBanner: false,

    setCaseInput: (update) => {
        set((state) => {
            const newCaseInput = { ...state.caseInput, ...update };
            // Clear errors for updated fields
            const newErrors = { ...state.errors };
            Object.keys(update).forEach(key => {
                if (key in newErrors) delete newErrors[key];
            });
            return { caseInput: newCaseInput, errors: newErrors };
        });
    },

    setErrors: (errors) => set({ errors }),

    setShowMdtBanner: (show) => set({ showMdtBanner: show }),

    calculate: () => {
        const { caseInput } = get();
        if (!caseInput) return;

        // Process logic
        const processedInput = { ...caseInput };
        if (processedInput.metastasis?.confirmed) {
            processedInput.staging = { ...processedInput.staging, M: 'M1' } as any;
            // Note: casting as any because Typescript might complain about partial updates if not fully matched, 
            // but here we just ensure logic follows previous implementation.
        }

        const stagingEngine = new StagingEngine();
        const treatmentEngine = new TreatmentEngine();

        try {
            const stagingResult: StagingOutput = stagingEngine.compute(processedInput);
            const treatmentInput = { ...processedInput, staging: stagingResult };
            const treatmentResult: TreatmentOutput = treatmentEngine.computeInitial(treatmentInput);

            const results: Results = { staging: stagingResult, treatment: treatmentResult };

            const showBanner = results.staging.stage.includes("IV") || (caseInput.histology === 'ATC');

            set({ results, showMdtBanner: showBanner });
        } catch (error) {
            console.error("Calculation error", error);
            // Optionally set error state here
        }
    },

    calculateAdjuvant: () => {
        const { caseInput, results } = get();
        if (!caseInput || !results) return;

        const adjuvantInput = { ...caseInput, stage_group: results.staging.stage as CaseInput['stage_group'] };
        const adjuvantResult = evaluateThyroidAdjuvant(adjuvantInput);

        if (adjuvantResult) {
            set((state) => ({
                results: state.results ? { ...state.results, adjuvant: adjuvantResult } : null
            }));
        }
    },

    reset: () => {
        set({
            caseInput: initialCaseState,
            results: null,
            errors: {},
            showMdtBanner: false
        });
    }
}));
