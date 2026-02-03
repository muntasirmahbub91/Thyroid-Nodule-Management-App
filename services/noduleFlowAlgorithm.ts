// Dr Muntasir's Thyroid Cancer Management App — Module Logic

import { ULTRASOUND_PRECHECKS, evaluateATA_USG, USInput as ATA_USInput, evaluateBTA_USG, BTAInput, evaluateACR_USG, evaluateACR_Manual, ACRInput, ACRResult } from '../constants/usgRules';
import { CYTOLOGY_RULES } from '../constants/cytologyRules';
import { THYROID_UPSTAGE_RULES } from '../constants/thyroidUpstageRules';
import { NoduleCaseInput, ActionOut, NoduleAction } from '../types';

const getInputValue = (path: string, obj: any): any => {
    return path.split('.').reduce((p, c) => (p && p[c] !== undefined) ? p[c] : null, obj);
};

const evaluateCondition = (condition: any, input: NoduleCaseInput): boolean => {
    const key = Object.keys(condition)[0];
    const args = condition[key];

    if (key === 'any' || key === 'or') {
        return Array.isArray(args) && args.some(cond => evaluateCondition(cond, input));
    }
    if (key === 'all' || key === 'and') {
        return Array.isArray(args) && args.every(cond => evaluateCondition(cond, input));
    }
    if (key === 'not') {
        return !evaluateCondition(args, input);
    }

    const value = getInputValue(args[0], input);

    if (value === null && key !== 'eq' && key !== 'is_absent') return false;

    switch (key) {
        case 'eq': return value === args[1];
        case 'in': return Array.isArray(args[1]) && args[1].includes(value);
        case '>': return typeof value === 'number' && value > args[1];
        case '>=': return typeof value === 'number' && value >= args[1];
        case '<': return typeof value === 'number' && value < args[1];
        case '<=': return typeof value === 'number' && value <= args[1];
        case 'is_absent': return value === null || value === undefined;
        default: return false;
    }
};

const evaluatePostOp = (caseIn: NoduleCaseInput): ActionOut | null => {
    // Guard clause: ensure post-op data is available to evaluate.
    if (!caseIn.post_op_histology || caseIn.post_op_histology.final_histology === "") {
        return null;
    }

    // Evaluate against specific rules for down-staging (NIFTP, minimally invasive) or up-staging (high-risk features).
    for (const rule of THYROID_UPSTAGE_RULES.rules) {
        let isMatch = false;
        if (rule.when_all) {
            isMatch = rule.when_all.every(cond => evaluateCondition(cond, caseIn));
        } else if (rule.when_any) {
            isMatch = rule.when_any.some(cond => evaluateCondition(cond, caseIn));
        }

        if (isMatch) {
            return {
                step: 'post_op',
                action: rule.action as NoduleAction,
                why: rule.why,
                proceed_to_management: rule.proceed_to_management
            };
        }
    }

    // If no specific rule matched, apply a default action for any remaining confirmed malignancy.
    // NIFTP is handled by a rule and is not considered malignant for these purposes.
    const finalHistology = caseIn.post_op_histology.final_histology;
    if (finalHistology && finalHistology !== 'NIFTP') {
        // Default for malignancies like PTC, Poorly Differentiated, or FTC/Oncocytic cases that didn't fit other rules.
        let whyMessage = `Malignancy (${finalHistology}) confirmed on final pathology. Completion thyroidectomy is typically recommended to enable adjuvant therapy and simplify surveillance.`;
        if (finalHistology === 'PTC') {
            whyMessage = `Final pathology confirmed Papillary Thyroid Carcinoma. Completion thyroidectomy is recommended.`;
        } else if (finalHistology === 'Poorly-differentiated') {
            whyMessage = `Final pathology confirmed Poorly-differentiated Carcinoma. Completion thyroidectomy is strongly recommended.`;
        }

        return {
            step: 'post_op',
            action: 'RECOMMEND_COMPLETION_TT',
            why: whyMessage,
            proceed_to_management: true
        };
    }

    // If it's not a malignancy or was handled by rules, no further action from this function.
    return null;
};


export const evaluateThyroidNoduleFlow = (caseIn: NoduleCaseInput): ActionOut => {
    // 0. Check for post-op histology first
    const postOpResult = evaluatePostOp(caseIn);
    if (postOpResult) {
        return postOpResult;
    }

    // 1. === SCAN OVERRIDE LOGIC (HOT NODULE) ===
    // This runs FIRST - a concordant hot nodule doesn't need diameter
    // Rule 1: Hot Nodule + Concordant = TOXIC ADENOMA (Override - No Biopsy)
    if (caseIn.scan_pattern === 'hot_nodule' && caseIn.scan_concordant === true) {
        return {
            step: 'precheck',
            action: 'TREAT_HYPERTHYROIDISM',
            why: 'Scan confirms Toxic Adenoma. Biopsy is NOT indicated (Hot Nodule override). The nodule is hyperfunctioning with <1% malignancy risk. Proceed to Hyperthyroid Treatment (RAI, ATDs, or Surgery).',
            proceed_to_management: false
        };
    }

    // 2. Check for required inputs (TSH and diameter) for all other pathways
    if (caseIn.TSH === null || caseIn.features.max_diameter_mm === null) {
        return { step: 'us_fna', action: 'AWAITING_INPUTS', why: 'Please provide TSH and Nodule Size to receive a recommendation.', proceed_to_management: false };
    }

    // Rule 2: Graves' Pattern = No Override (proceed with standard US criteria)
    // Rule 3: Hot Nodule + Mismatch = No Override (treat as cold nodule)
    // Rule 4: Cold/Indeterminate = No Override
    // These cases will fall through to the normal ultrasound evaluation below

    // Legacy precheck for continue_despite_low_tsh (if user wants to proceed despite other warnings)
    if (!caseIn.continue_despite_low_tsh && caseIn.scan_pattern === 'not_performed') {
        // Only run old prechecks if scan wasn't performed and TSH is low
        for (const rule of ULTRASOUND_PRECHECKS.rules) {
            if (evaluateCondition(rule.when_all[0], caseIn)) {
                return { step: 'precheck', action: rule.action as NoduleAction, why: rule.why, proceed_to_management: false };
            }
        }
    }

    const hasBethesdaCytology = caseIn.cytology_system === 'Bethesda' && !!caseIn.bethesda_cat;
    const hasRCPathCytology = caseIn.cytology_system === 'RCPath_Thy' && !!caseIn.rcpath_thy;


    // --- BTA Guideline Logic ---
    if (caseIn.guideline === 'BTA') {
        const compositionMap: Record<string, 'solid' | 'mixed' | 'cystic' | 'spongiform' | ''> = {
            'solid': 'solid', 'part_cystic': 'mixed', 'pure_cyst': 'cystic', 'spongiform': 'spongiform'
        };
        const calcificationMap: Record<string, 'none' | 'micro' | 'macro' | ''> = {
            'none': 'none', 'microcalcifications': 'micro', 'macrocalcifications': 'macro'
        };

        const btaInput: BTAInput = {
            composition: compositionMap[caseIn.features.composition] || '',
            echogenicity: caseIn.features.echogenicity === 'hyperechoic' ? 'isoechoic' : caseIn.features.echogenicity,
            margins: caseIn.features.margins,
            calcifications: calcificationMap[caseIn.features.calcifications] || 'none',
            vascularity: caseIn.features.vascularity,
            shape: caseIn.features.shape,
            diameter_mm: caseIn.features.max_diameter_mm,
            suspicious_nodes: caseIn.node_suspicious,
        };

        const btaResult = evaluateBTA_USG(btaInput);
        const uClassMatch = btaResult.category.match(/U(\d)/);
        const assignedU = uClassMatch ? `U${uClassMatch[1]}` as NoduleCaseInput['assigned_u'] : undefined;

        const classifiedCaseForDiscordance = { ...caseIn, assigned_u: assignedU };

        if (hasRCPathCytology) {
            for (const rule of CYTOLOGY_RULES.discordance_rules) {
                if (evaluateCondition({ all: rule.when_all }, classifiedCaseForDiscordance)) {
                    return { step: 'post_fna', action: rule.action as NoduleAction, why: rule.why, proceed_to_management: false };
                }
            }
            const postFnaRules = CYTOLOGY_RULES.post_fna_actions.RCPath_Thy;
            const cat = caseIn.rcpath_thy;
            const rule = postFnaRules.find((r: any) => r.cat === cat);
            if (rule) {
                const isMalignant = ['Thy4', 'Thy5'].includes(cat as string);
                return { step: 'post_fna', action: rule.action as NoduleAction, why: rule.why, interval_months: rule.interval_months, proceed_to_management: isMalignant };
            }
        }

        const actionMap: Record<string, NoduleAction> = {
            'FNA of suspicious node (mandatory)': 'FNA_NODE_WITH_WASHOUT',
            'FNA recommended': 'FNA_PRIMARY',
            'Observe with repeat US': 'US_SURVEILLANCE',
            'Observe with follow-up': 'US_SURVEILLANCE',
            'Surveillance': 'US_SURVEILLANCE',
            'Observe': 'US_SURVEILLANCE',
            'Optional FNA or Observe': 'CONSIDER_FNA_OR_OBSERVE',
            'No FNA': 'NO_FNA_ROUTINE',
            'Observe and correlate clinically': 'US_SURVEILLANCE'
        };
        const action = actionMap[btaResult.action] || 'US_SURVEILLANCE';
        let washout;
        if (action === 'FNA_NODE_WITH_WASHOUT') {
            washout = caseIn.calcitonin_elevated ? "Calcitonin_washout" : "Tg_washout";
        }

        return { step: 'us_fna', action, why: btaResult.rationale, washout, proceed_to_management: false, assigned_pattern: btaResult.category };
    }

    // --- ATA Guideline Logic ---
    if (caseIn.guideline === 'ATA') {
        const ataInput: ATA_USInput = {
            composition: caseIn.features.composition,
            echogenicity: caseIn.features.echogenicity,
            margins: caseIn.features.margins,
            shape: caseIn.features.shape,
            calcifications: caseIn.features.calcifications,
            extrathyroidal_extension: caseIn.features.extrathyroidal_extension,
            diameter_mm: caseIn.features.max_diameter_mm,
            suspicious_lymph_node: caseIn.node_suspicious,
        };
        const ataResult = evaluateATA_USG(ataInput);

        const ataPatternMap: Record<string, NoduleCaseInput['assigned_pattern']> = {
            "High Suspicion": "ATA_high", "Intermediate Suspicion": "ATA_intermediate",
            "Low Suspicion": "ATA_low", "Very Low Suspicion": "ATA_very_low",
            "Benign": "ATA_benign"
        };
        const assignedPattern = ataPatternMap[ataResult.pattern];
        const classifiedCaseForDiscordance = { ...caseIn, assigned_pattern: assignedPattern };

        if (hasBethesdaCytology) {
            for (const rule of CYTOLOGY_RULES.discordance_rules) {
                if (evaluateCondition({ all: rule.when_all }, classifiedCaseForDiscordance)) {
                    return { step: 'post_fna', action: rule.action as NoduleAction, why: rule.why, proceed_to_management: false };
                }
            }
            const postFnaRules = CYTOLOGY_RULES.post_fna_actions.Bethesda;
            const cat = caseIn.bethesda_cat;
            const rule = postFnaRules.find((r: any) => r.cat === cat);
            if (rule) {
                const isMalignant = ['V', 'VI'].includes(cat as string);
                return { step: 'post_fna', action: rule.action as NoduleAction, why: rule.why, interval_months: rule.interval_months, proceed_to_management: isMalignant };
            }
        }

        const actionMap: Record<string, NoduleAction> = {
            'FNA recommended': 'FNA_PRIMARY',
            'Observe': 'US_SURVEILLANCE',
            'Optional FNA or Observation': 'CONSIDER_FNA_OR_OBSERVE',
            'No FNA (observe if symptomatic)': 'NO_FNA_THERAPEUTIC_ASPIRATION_IF_SYMPTOMATIC',
            'FNA of suspicious lymph node': 'FNA_NODE_WITH_WASHOUT',
            'Clinical correlation and follow-up': 'US_SURVEILLANCE',
            'Awaiting Inputs': 'AWAITING_INPUTS'
        };
        const action = actionMap[ataResult.action] || 'US_SURVEILLANCE';
        let washout;
        if (action === 'FNA_NODE_WITH_WASHOUT') {
            washout = caseIn.calcitonin_elevated ? "Calcitonin_washout" : "Tg_washout";
        }

        // High risk patterns should allow proceeding to tumor management
        const isHighRiskPattern = assignedPattern === 'ATA_high' || assignedPattern === 'ATA_intermediate';
        const proceedToManagement = isHighRiskPattern && action === 'FNA_PRIMARY'; // Allow if high risk but maybe user wants to skip to surgery

        return {
            step: 'us_fna',
            action,
            why: ataResult.rationale,
            washout,
            proceed_to_management: proceedToManagement,
            assigned_pattern: ataResult.pattern
        };
    }

    // --- ACR TI-RADS Guideline Logic ---
    if (caseIn.guideline === 'ACR') {
        // Map generic features to ACR specific inputs
        // Note: USFeatures in types.ts is generic. We map closely to ACR terms.

        let acrEchogenicity: ACRInput['echogenicity'] = '';
        if (caseIn.features.composition === 'pure_cyst') acrEchogenicity = 'anechoic';
        else if (caseIn.features.echogenicity === 'hyperechoic') acrEchogenicity = 'hyperechoic';
        else if (caseIn.features.echogenicity === 'isoechoic') acrEchogenicity = 'isoechoic';
        else if (caseIn.features.echogenicity === 'hypoechoic') acrEchogenicity = 'hypoechoic';
        else if (caseIn.features.echogenicity === 'markedly_hypoechoic') acrEchogenicity = 'very_hypoechoic';

        let acrComposition: ACRInput['composition'] = '';
        if (caseIn.features.composition === 'pure_cyst') acrComposition = 'cystic';
        else if (caseIn.features.composition === 'spongiform') acrComposition = 'spongiform';
        else if (caseIn.features.composition === 'part_cystic') acrComposition = 'mixed';
        else if (caseIn.features.composition === 'solid') acrComposition = 'solid';

        let acrMargins: ACRInput['margins'] = '';
        if (caseIn.features.margins === 'smooth') acrMargins = 'smooth';
        else if (caseIn.features.margins === 'ill_defined') acrMargins = 'ill_defined';
        else if (caseIn.features.margins === 'lobulated') acrMargins = 'lobulated';
        else if (caseIn.features.margins === 'irregular') acrMargins = 'irregular';
        if (caseIn.features.extrathyroidal_extension) acrMargins = 'extrathyroidal';

        let acrFoci: ACRInput['echogenic_foci'] = '';
        if (caseIn.features.calcifications === 'none') acrFoci = 'none';
        else if (caseIn.features.calcifications === 'macrocalcifications') acrFoci = 'macro';
        else if (caseIn.features.calcifications === 'microcalcifications') acrFoci = 'punctate';
        else if (caseIn.features.calcifications === 'peripheral' as any) acrFoci = 'peripheral';

        let acrResult: ACRResult;

        if (caseIn.manual_ti_rads_level) {
            acrResult = evaluateACR_Manual(caseIn.manual_ti_rads_level, caseIn.features.max_diameter_mm || 0);
        } else {
            const acrInput: ACRInput = {
                composition: acrComposition,
                echogenicity: acrEchogenicity,
                shape: caseIn.features.shape === 'taller_than_wide' ? 'taller_than_wide' : 'wider_than_tall',
                margins: acrMargins,
                echogenic_foci: acrFoci,
                diameter_mm: caseIn.features.max_diameter_mm!,
                suspicious_nodes: caseIn.node_suspicious
            };
            acrResult = evaluateACR_USG(acrInput);
        }

        // Discordance check (generic mapping of TR levels to high/low logic if needed, but ACR is self-contained)
        const assignedPattern = acrResult.level as NoduleCaseInput['assigned_pattern'];
        const classifiedCaseForDiscordance = { ...caseIn, assigned_pattern: assignedPattern };

        if (hasBethesdaCytology) {
            // We can reuse discordance rules or define ACR specific ones. 
            // For now, let's assume generic high-risk rules apply if TR5/TR4 matched to Bethesda Benign.
            // CYTOLOGY_RULES.discordance_rules usually check for "High Suspicion" or "ATA_high".
            // We might need to map TR5 to ATA_high contextually if we want those rules to fire, 
            // or update CYTOLOGY_RULES to understand TR5.
            // For simplicity/safety, we won't force ATA-based discordance rules on ACR yet unless strictly matching.

            const postFnaRules = CYTOLOGY_RULES.post_fna_actions.Bethesda; // ACR uses Bethesda too
            const cat = caseIn.bethesda_cat;
            const rule = postFnaRules.find((r: any) => r.cat === cat);
            if (rule) {
                const isMalignant = ['V', 'VI'].includes(cat as string);
                return { step: 'post_fna', action: rule.action as NoduleAction, why: rule.why, interval_months: rule.interval_months, proceed_to_management: isMalignant };
            }
        }

        const actionMap: Record<string, NoduleAction> = {
            'FNA recommended': 'FNA_PRIMARY',
            'No FNA': 'NO_FNA_ROUTINE',
            'US Follow-up': 'US_SURVEILLANCE',
            'FNA of suspicious node': 'FNA_NODE_WITH_WASHOUT',
            'No Follow-up required (<1.5cm)': 'NO_FNA_ROUTINE', // simplistic mapping
            'No Follow-up required (<1cm)': 'NO_FNA_ROUTINE',
            'No Follow-up typically required (<0.5cm)': 'NO_FNA_ROUTINE'
        };
        // Fallback for actions not exact string match (ACR logic returns specific strings)
        // IMPORTANT: Check for 'No FNA' BEFORE 'FNA' to avoid substring mismatch
        let action: NoduleAction = 'US_SURVEILLANCE';
        if (acrResult.action === 'Awaiting Inputs') action = 'AWAITING_INPUTS';
        else if (acrResult.action.includes('No FNA') || acrResult.action.includes('No Follow-up')) action = 'NO_FNA_ROUTINE';
        else if (acrResult.action.includes('FNA')) action = 'FNA_PRIMARY';
        else if (acrResult.action.includes('Follow-up')) action = 'US_SURVEILLANCE';

        if (acrResult.action === 'FNA of suspicious node') action = 'FNA_NODE_WITH_WASHOUT';

        let washout;
        if (action === 'FNA_NODE_WITH_WASHOUT') {
            washout = caseIn.calcitonin_elevated ? "Calcitonin_washout" : "Tg_washout";
        }

        // TR5 should allow proceeding to tumor management
        const isHighRiskPattern = acrResult.level === 'TR5';
        const proceedToManagement = isHighRiskPattern && action === 'FNA_PRIMARY';

        return {
            step: 'us_fna',
            action,
            why: acrResult.rationale,
            washout,
            proceed_to_management: proceedToManagement,
            assigned_pattern: acrResult.level
        };
    }


    const finalResult = { step: 'us_fna', action: 'AWAITING_INPUTS', why: 'No matching rule found or guideline not supported.', proceed_to_management: false } as ActionOut;

    // Final check: if action is SURGERY or DIAGNOSTIC_LOBECTOMY, usually we can proceed
    if (finalResult.action === 'SURGERY' || finalResult.action === 'DIAGNOSTIC_LOBECTOMY') {
        finalResult.proceed_to_management = true;
    }

    return finalResult;
};