// Dr Muntasir's Thyroid Cancer Management App — Module Logic
// Centralized data source for the GuidelineInfoViewer component.

import { CYTOLOGY_RULES } from './cytologyRules';
import { INITIAL_TREATMENT_RULES } from './initialTreatmentRules';
import { THYROID_CANCER_STAGE_MAP } from './stageMaps';
import { THYROID_ADJUVANT_RULES } from './thyroidAdjuvantRules';

// --- Manually structured USG Rules for display ---
const USG_RISK_STRATIFICATION = {
    title: 'Ultrasound (USG) Risk',
    description: 'Rules for classifying thyroid nodules based on ultrasound features to determine the need for FNA.',
    guidelines: [
        {
            name: 'ATA 2015 Patterns',
            rules: [
                { name: 'High Suspicion', risk: '70-90%', threshold: 'FNA ≥ 10 mm', rationale: 'Solid hypoechoic nodule with at least one of: irregular margins, microcalcifications, taller-than-wide shape, or extrathyroidal extension.' },
                { name: 'Intermediate Suspicion', risk: '10-20%', threshold: 'FNA ≥ 10 mm', rationale: 'Hypoechoic solid nodule with smooth margins and no high-risk features.' },
                { name: 'Low Suspicion', risk: '5-10%', threshold: 'FNA ≥ 15 mm', rationale: 'Isoechoic or hyperechoic solid nodule, or partially cystic nodule without suspicious features.' },
                { name: 'Very Low Suspicion', risk: '<3%', threshold: 'FNA ≥ 20 mm or Observe', rationale: 'Spongiform or partially cystic nodules without any suspicious US features.' },
                { name: 'Benign', risk: '<1%', threshold: 'No FNA', rationale: 'Purely cystic nodules. FNA is not recommended unless for symptomatic relief.' },
            ]
        },
        {
            name: 'BTA 2017 (U-Classification)',
            rules: [
                { name: 'U5 – Malignant', risk: '≥85%', threshold: 'FNA ≥ 10 mm', rationale: 'Markedly hypoechoic nodules with suspicious features like irregular margins, microcalcifications, or associated pathologic nodes.' },
                { name: 'U4 – Suspicious', risk: '~60-75%', threshold: 'FNA ≥ 10 mm', rationale: 'Hypoechoic nodules with features like irregular/lobulated margins or taller-than-wide shape.' },
                { name: 'U3 – Indeterminate', risk: '~10-20%', threshold: 'FNA ≥ 15 mm', rationale: 'Mildly hypoechoic or mixed echogenicity nodules without definite suspicious features.' },
                { name: 'U2 – Benign', risk: '~1-2%', threshold: 'No FNA', rationale: 'Features consistent with benignity, such as spongiform appearance or comet-tail artifacts.' },
                { name: 'U1 – Normal', risk: '0%', threshold: 'No FNA', rationale: 'Normal thyroid parenchyma with no discrete nodule.' },
            ]
        }
    ]
};

// --- Remapped Cytology Rules for display ---
const CYTOLOGY_MANAGEMENT = {
    title: 'Cytology (FNA)',
    description: 'Management recommendations based on fine-needle aspiration cytology results.',
    guidelines: [
        {
            name: 'Bethesda System (ATA)',
            rules: CYTOLOGY_RULES.post_fna_actions.Bethesda.map(r => ({ name: `Bethesda ${r.cat}`, recommendation: r.why, criteria: [] }))
        },
        {
            name: 'RCPath System (BTA)',
            rules: CYTOLOGY_RULES.post_fna_actions.RCPath_Thy.map(r => ({ name: r.cat, recommendation: r.why, criteria: [] }))
        }
    ]
};

// --- Formatted Staging Rules for display ---
const formatStagingRule = (rule: any, ageGroup?: string) => {
    const criteria: string[] = [];
    if (ageGroup) criteria.push(`Age ${ageGroup}`);
    if (rule.T) criteria.push(`T in [${rule.T.join(', ')}]`);
    if (rule.anyT) criteria.push(`Any T`);
    if (rule.N) criteria.push(`N in [${rule.N.join(', ')}]`);
    if (rule.anyN) criteria.push(`Any N`);
    if (rule.M) criteria.push(`M is ${rule.M}`);
    
    return {
        name: `Stage ${rule.stage}`,
        recommendation: `Assigned based on TNM combination and age.`,
        criteria: criteria
    };
};

const dtcAgeGte55Rules = (THYROID_CANCER_STAGE_MAP.differentiated.stageGroups[1] as any).stages.map((r:any) => formatStagingRule(r, '≥55'));
const dtcAgeLt55Rules = [
    { name: 'Stage I', recommendation: 'All non-metastatic disease in patients < 55 years is Stage I.', criteria: ['Age <55', 'M0'] },
    { name: 'Stage II', recommendation: 'All metastatic disease in patients < 55 years is Stage II.', criteria: ['Age <55', 'M1'] }
];

const STAGING_RULES = {
    title: 'AJCC 8th Edition Staging',
    description: 'Rules for determining the TNM stage group based on tumor characteristics and patient age.',
    guidelines: [
        {
            name: 'Differentiated Thyroid Cancer (DTC)',
            rules: [...dtcAgeLt55Rules, ...dtcAgeGte55Rules]
        },
        {
            name: 'Medullary Thyroid Cancer (MTC)',
            rules: THYROID_CANCER_STAGE_MAP.medullary.stageGroups.map(r => formatStagingRule(r))
        },
        {
            name: 'Anaplastic Thyroid Cancer (ATC)',
            rules: THYROID_CANCER_STAGE_MAP.anaplastic.stageGroups.map(r => formatStagingRule(r))
        }
    ]
};


// --- Remapped Treatment Rules for display ---
const INITIAL_TREATMENT = {
    title: 'Initial Treatment',
    description: 'Rules for determining the appropriate initial surgical management for thyroid cancer.',
    guidelines: [
        {
            name: 'Thyroid Surgery',
            rules: INITIAL_TREATMENT_RULES.thyroid_surgery.map(r => ({ name: r.label, recommendation: r.explain, criteria: [] }))
        },
        {
            name: 'Neck Surgery',
            rules: INITIAL_TREATMENT_RULES.neck_surgery.map(r => ({ name: r.label, recommendation: r.explain, criteria: [] }))
        }
    ]
};

// --- Remapped Adjuvant Rules for Display ---
const ADJUVANT_THERAPY = {
    title: 'Adjuvant Therapy',
    description: 'Post-operative adjuvant therapy recommendations based on histology and risk features.',
    guidelines: [
        {
            name: 'Differentiated Thyroid Cancer (DTC)',
            rules: THYROID_ADJUVANT_RULES.differentiated.map(r => ({ name: r.title, recommendation: r.recommendation, rationale: r.rationale, criteria: [] }))
        },
        {
            name: 'Medullary Thyroid Cancer (MTC)',
            rules: THYROID_ADJUVANT_RULES.medullary.map(r => ({ name: r.title, recommendation: r.recommendation, rationale: r.rationale, criteria: [] }))
        },
        {
            name: 'Anaplastic Thyroid Cancer (ATC)',
            rules: THYROID_ADJUVANT_RULES.anaplastic.map(r => ({ name: r.title, recommendation: r.recommendation, rationale: r.rationale, criteria: [] }))
        }
    ]
};

export const GUIDELINE_INFO_DATA = {
    usg: USG_RISK_STRATIFICATION,
    cytology: CYTOLOGY_MANAGEMENT,
    staging: STAGING_RULES,
    initialTreatment: INITIAL_TREATMENT,
    adjuvant: ADJUVANT_THERAPY,
};
