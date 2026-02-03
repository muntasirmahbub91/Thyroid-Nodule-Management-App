import { useCallback, useMemo } from 'react';
import { ThyroidCaseContext } from '../types';
import { RuleEngine, RuleEffect } from '../services/RuleEngine';

// Import Logic Modules
import { TSH_INITIAL_GATING } from '../constants/rules/TSH_INITIAL_GATING';
import { US_TO_FNAC_DECISION } from '../constants/rules/US_TO_FNAC_DECISION';
import { LOW_TSH_SCAN_OVERRIDE } from '../constants/rules/LOW_TSH_SCAN_OVERRIDE';
import { HYPERTHYROID_TREATMENT_SELECTOR } from '../constants/rules/HYPERTHYROID_TREATMENT_SELECTOR';
import { BETHESDA_FNAC_MANAGEMENT } from '../constants/rules/BETHESDA_FNAC_MANAGEMENT';
import { SURGERY_EXTENT_AND_NECK_MANAGEMENT } from '../constants/rules/SURGERY_EXTENT_AND_NECK_MANAGEMENT';

export interface AlgorithmResult {
    immediate_actions: string[];
    next_step: string | null;
    rationale: string[];
    terminal_plan: string | null;
}

export const useThyroidAlgorithm = () => {

    const flattenContext = (context: ThyroidCaseContext): any => {
        // Flatten the object for easier rule processing (e.g. "tsh_value" instead of "tsh.value")
        // This mapping must align with the "inputs" defined in your JSON modules.

        const safeGet = (fn: () => any) => { try { return fn() } catch { return undefined } };

        return {
            // Module 1: TSH
            tsh_value_miu_l: context.tsh.value,
            tsh_status: context.tsh.status,
            red_flags: context.clinical.red_flags,
            red_flags_present: context.clinical.red_flags.length > 0,
            pregnant: context.clinical.is_pregnant,
            lactating: context.clinical.is_lactating,

            // Module 2: US
            us_system: context.ultrasound.system,
            suspicious_cervical_nodes: context.ultrasound.suspicious_nodes,
            // Logic for "current evaluation nodule":
            // In a real app, you'd iterate all nodules. Here checking the 'index' or first nodule.
            pattern: context.ultrasound.nodules[0]?.pattern,
            size_cm: context.ultrasound.nodules[0]?.size_cm,

            // Module 3: Scan
            scan_pattern: context.scan?.pattern,
            concordance: context.scan?.concordance,

            // Module 4: Hyperthyroid
            etiology: context.hyperthyroidism?.etiology,
            compressive_symptoms: context.hyperthyroidism?.compressive_symptoms,
            preference: context.hyperthyroidism?.patient_preference,

            // Module 5: Pathology
            bethesda_category: context.pathology?.bethesda_category,
            prior_nondiagnostic_count: context.pathology?.prior_nondiagnostic_count ?? 0,
            molecular_available: context.pathology?.molecular_available,

            // Module 6: Surgery
            malignancy_confirmed: context.cancer_extent?.malignancy_confirmed,
            nodal_status: context.cancer_extent?.nodal_status,
            // tumor_size handled by size_cm mapping above or specific checks
            gross_ete: context.cancer_extent?.gross_ete,
            multifocality: context.cancer_extent?.multifocality,
            distant_metastasis: context.cancer_extent?.distant_metastasis,
            bilateral_disease: context.cancer_extent?.bilateral_disease,
        };
    };

    const evaluate = useCallback((context: ThyroidCaseContext): AlgorithmResult => {
        const flatContext = flattenContext(context);
        const result: AlgorithmResult = {
            immediate_actions: [],
            next_step: null,
            rationale: [],
            terminal_plan: null
        };

        // --- Step 1: TSH Gating ---
        const tshResult = RuleEngine.evaluate(TSH_INITIAL_GATING, flatContext);
        if (tshResult) {
            if (tshResult.action) result.immediate_actions.push(tshResult.action);
            if (tshResult.reason) result.rationale.push(tshResult.reason);

            if (tshResult.action === "URGENT_REFERRAL") {
                result.terminal_plan = "URGENT_ENDOCRINE_SURGERY_REFERRAL";
                return result; // Stop traversal
            }

            if (tshResult.action === 'SCAN_PATHWAY_AVAILABLE') {
                // Determine if we actually proceed to scan or US module based on context? 
                // For now, let's assume we flow to Scan Logic check ONLY IF specific flag set?
                // Or simply proceed to Module 3 immediately?
                // The algorithm text says: "Enable Radionuclide Scan workflow" -> "Proceed to US Module"
            }
        }

        // --- Step 2: Ultrasound to FNAC (Anatomic Risk) ---
        // Assuming we are past gating
        const usResult = RuleEngine.evaluate(US_TO_FNAC_DECISION, flatContext);
        let recommendedBiopsy = false;

        if (usResult) {
            if (usResult.action && usResult.action.includes("FNA")) {
                recommendedBiopsy = true;
                result.immediate_actions.push(usResult.action);
                if (usResult.reason) result.rationale.push(usResult.reason);
            } else if (usResult.action === "CONSIDER_FNA") {
                // Soft recommendation
                result.immediate_actions.push(usResult.action);
                if (usResult.reason) result.rationale.push(usResult.reason);
            }
        }

        // --- Step 3: Low TSH Scan Override ---
        /* "If TSH is Low, check if we can cancel the biopsy" */
        if (context.tsh.status === "LOW_OR_SUPPRESSED") {
            const scanOverride = RuleEngine.evaluate(LOW_TSH_SCAN_OVERRIDE, flatContext);
            if (scanOverride && scanOverride.override_fna) {
                // CANCEL BIOPSY
                recommendedBiopsy = false;
                result.immediate_actions = result.immediate_actions.filter(a => !a.includes("FNA"));
                result.rationale.push("Biopsy cancelled: " + scanOverride.reason);

                // Divert to Hyperthyroid Module
                if (scanOverride.next_module === "HYPERTHYROID_TREATMENT_SELECTOR") {
                    result.next_step = "HYPERTHYROID_MANAGEMENT";

                    // Evaluate Module 4 immediately if we have inputs?
                    const hyperResult = RuleEngine.evaluate(HYPERTHYROID_TREATMENT_SELECTOR, flatContext);
                    if (hyperResult) {
                        result.terminal_plan = hyperResult.recommendation;
                        if (hyperResult.reason) result.rationale.push(hyperResult.reason);
                        return result;
                    }
                }
            }
        }

        // Return if we stopped at FNA recommendation
        if (recommendedBiopsy) {
            result.next_step = "PERFORM_FNA_AND_PATHOLOGY";
            return result;
        }


        // --- Step 4: Bethesda Management (Post-FNA) ---
        if (context.pathology) {
            const pathResult = RuleEngine.evaluate(BETHESDA_FNAC_MANAGEMENT, flatContext);
            if (pathResult) {
                if (pathResult.action) result.immediate_actions.push(pathResult.action);
                if (pathResult.reason) result.rationale.push(pathResult.reason);

                if (pathResult.action === "DEFINITIVE_SURGERY_PATHWAY") {
                    // Flow to surgery extent
                    // Fall through to Module 6
                } else {
                    // Stop here (Repeat FNA, Surveillance, etc)
                    result.next_step = pathResult.next_steps ? pathResult.next_steps[0] : "FOLLOW_UP";
                    return result;
                }
            }
        }

        // --- Step 5: Surgery Extent ---
        // If malignancy confirmed or diagnostic lobectomy required (from manual override or path result)
        // Note: Bethesda IV rule returns 'DIAGNOSTIC_LOBECTOMY'. We might want to run Surgery Extent to see if total is needed despite it being diagnostic? 
        // Typically diagnostic is Lobectomy unless high risk features exist.

        if (context.cancer_extent?.malignancy_confirmed) {
            const surgeryResult = RuleEngine.evaluate(SURGERY_EXTENT_AND_NECK_MANAGEMENT, flatContext);
            if (surgeryResult) {
                result.terminal_plan = `${surgeryResult.thyroid} + ${surgeryResult.neck}`;
                if (surgeryResult.reason) result.rationale.push(surgeryResult.reason);
            }
        }

        return result;

    }, []);

    return { evaluate };
};
