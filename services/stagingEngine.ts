// Dr Muntasir's Thyroid Cancer Management App — Module Logic
import { CaseInput, StagingOutput } from '../types';
import { THYROID_CANCER_STAGE_MAP } from '../constants/stageMaps';

export class StagingEngine {

    public compute(input: CaseInput): StagingOutput {
        const T = this.computeT(input);
        const N = this.computeN(input);
        const M = this.computeM(input);

        const { stage, stage_why } = this.computeStage(T.category, N.category, M.category, input);

        return {
            T: T.category,
            T_why: T.why,
            N: N.category,
            N_why: N.why,
            M: M.category,
            M_why: M.why,
            stage,
            stage_why,
        };
    }

    private computeT(input: CaseInput): { category: string; why: string } {
        const size = input.primary?.size_cm?.value;
        const etePlanes = input.primary?.grossEtePlanes || [];

        // Very advanced disease (T4b)
        if (etePlanes.includes('prevertebral') || etePlanes.includes('carotid/mediastinal')) {
            return { category: 'T4b', why: 'Very advanced disease: invasion of prevertebral fascia, carotid artery, or mediastinal vessels.' };
        }

        // Gross ETE (T4a)
        if (etePlanes.some(p => ['subcut', 'larynx', 'trachea', 'esophagus', 'RLN'].includes(p))) {
            return { category: 'T4a', why: 'Gross extrathyroidal extension into subcutaneous tissue, larynx, trachea, esophagus, or recurrent laryngeal nerve.' };
        }

        // Minimal ETE (T3b) - invasion of strap muscles only
        if (etePlanes.includes('strap')) {
            return { category: 'T3b', why: 'Minimal extrathyroidal extension (invasion of strap muscles only).' };
        }

        // Size-based T-category (Intrathyroidal)
        if (size) {
            if (size > 4) {
                // For DTC/ATC, this is T3a. For MTC, it's T3.
                const category = input.histology === 'MTC' ? 'T3' : 'T3a';
                return { category, why: 'Tumor >4cm, limited to thyroid.' };
            }
            if (size > 2) return { category: 'T2', why: 'Tumor >2cm but <=4cm, limited to thyroid.' };
            if (size > 1) return { category: 'T1b', why: 'Tumor >1cm but <=2cm, limited to thyroid.' };
            if (size <= 1) return { category: 'T1a', why: 'Tumor <=1cm, limited to thyroid.' };
        }

        return { category: 'TX', why: 'Primary tumor cannot be assessed.' };
    }

    private computeN(input: CaseInput): { category: string; why: string } {
        const levels = input.nodes?.levels;
        if (levels?.lateral_neck_or_retropharyngeal) {
            const why = input.histology === 'MTC'
                ? 'Metastasis to lateral cervical or mediastinal nodes.'
                : 'Metastasis to lateral neck (I-V) or retropharyngeal nodes.';
            return { category: 'N1b', why };
        }
        if (levels?.level_vi_vii) {
            const why = input.histology === 'MTC'
                ? 'Metastasis to central compartment (Level VI) nodes.'
                : 'Metastasis to central compartment (VI) or upper mediastinal (VII) nodes.';
            return { category: 'N1a', why };
        }
        return { category: 'N0', why: 'No clinical evidence of regional lymph node metastasis.' };
    }

    private computeM(input: CaseInput): { category: string; why: string } {
        return input.metastasis?.confirmed
            ? { category: 'M1', why: 'Distant metastasis confirmed.' }
            : { category: 'M0', why: 'No distant metastasis.' };
    }

    private computeStage(T: string, N: string, M: string, input: CaseInput): { stage: string; stage_why: string; } {
        const histology = input.histology;
        const age = input.patient?.age_years;

        let schema;
        let why_prefix = "";

        if (histology?.startsWith('DTC')) {
            schema = THYROID_CANCER_STAGE_MAP.differentiated;
            if (age === undefined) return { stage: 'Unknown', stage_why: 'Patient age is required for DTC staging.' };

            const ageGroup = age < 55 ? schema.stageGroups[0] : schema.stageGroups[1];

            if (age < 55) {
                const stage = M === 'M1' ? ageGroup.M1 : ageGroup.M0;
                const why = `Patient age < 55. Stage is determined solely by metastatic status.`;
                return { stage: stage!, stage_why: why };
            }
            // Age >= 55
            why_prefix = `Patient age ≥ 55. `;
            const rules = (ageGroup as any).stages;
            for (const rule of rules) {
                const tMatch = rule.anyT || rule.T.some((tCat: string) => T.startsWith(tCat));
                const nMatch = rule.anyN || rule.N.includes(N);
                const mMatch = rule.M === M;

                if (tMatch && nMatch && mMatch) {
                    return { stage: rule.stage, stage_why: `${why_prefix}TNM combination matches ${rule.stage} criteria.` };
                }
            }
        } else if (histology === 'MTC') {
            schema = THYROID_CANCER_STAGE_MAP.medullary;
            const rules = schema.stageGroups;
            for (const rule of rules) {
                const tMatch = rule.anyT || rule.T.some((tCat: string) => T.startsWith(tCat));
                const nMatch = rule.anyN || rule.N.includes(N);
                const mMatch = rule.M === M;

                if (tMatch && nMatch && mMatch) {
                    return { stage: rule.stage, stage_why: `TNM combination matches ${rule.stage} criteria for MTC.` };
                }
            }
        } else if (histology === 'ATC') {
            schema = THYROID_CANCER_STAGE_MAP.anaplastic;
            const rules = schema.stageGroups;
            for (const rule of rules) {
                const tMatch = rule.anyT || rule.T.includes(T);
                const nMatch = rule.anyN || rule.N.includes(N);
                const mMatch = rule.M === M;
                if (tMatch && nMatch && mMatch) {
                    return { stage: rule.stage, stage_why: `All anaplastic carcinomas are considered Stage IV.` };
                }
            }
        }

        return { stage: 'Unknown', stage_why: 'No matching staging rule found for the provided inputs.' };
    }
}
