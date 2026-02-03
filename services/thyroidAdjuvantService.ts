// Dr Muntasir's Thyroid Cancer Management App — Module Logic

import { CaseInput, AdjuvantOutput } from '../types';
import { THYROID_ADJUVANT_RULES } from '../constants/thyroidAdjuvantRules';

const getInputValue = (path: string, input: CaseInput): any => {
    // This maps the string key from a rule to the actual value in the CaseInput object.
    const mapping: { [key: string]: any } = {
        'histology': input.histology, 'stage_group': input.stage_group,
        'rai_contraindicated': input.patient?.rai_contraindicated, 'index_surgery': input.index_surgery,
        'largest_focus_cm': input.largest_focus_cm, 'gross_ETE': input.gross_ETE,
        'N_pattern': input.N_pattern, 'nodes_positive_count': input.nodes_positive_count,
        'lymphatic_invasion': input.lymphatic_invasion, 'vascular_invasion': input.vascular_invasion,
        'multifocal_macroscopic': input.multifocal_macroscopic, 'hist_variant_high_risk': input.hist_variant_high_risk,
        'differentiated_high_grade': input.differentiated_high_grade, 'margin_status': input.margin_status,
        'tg_unstim_ng_ml': input.tg_unstim_ng_ml, 'tg_ab': input.tg_ab,
        'neck_ultrasound_negative': input.neck_ultrasound_negative, 'margin_status_mtc': input.margin_status_mtc,
        'gross_residual': input.gross_residual, 'resectable': input.resectable,
    };
    return mapping[path];
};

const evaluateCondition = (condition: any, input: CaseInput): boolean => {
    const key = Object.keys(condition)[0];
    const args = condition[key];
    
    if (key === 'and') return Array.isArray(args) && args.every(cond => evaluateCondition(cond, input));
    if (key === 'or') return Array.isArray(args) && args.some(cond => evaluateCondition(cond, input));
    
    const value = getInputValue(args[0], input);
    if (value === undefined || value === null) return false;

    switch (key) {
        case 'eq': return value === args[1];
        case 'in': return Array.isArray(args[1]) && args[1].includes(value);
        case '>': return typeof value === 'number' && value > args[1];
        case '>=': return typeof value === 'number' && value >= args[1];
        case '<': return typeof value === 'number' && value < args[1];
        case '<=': return typeof value === 'number' && value <= args[1];
        default: return false;
    }
};

export const evaluateThyroidAdjuvant = (input: CaseInput): AdjuvantOutput | null => {
    if (!input.histology) return null;

    let ruleset: any[] = [];
    if (input.histology.startsWith('DTC')) {
        ruleset = THYROID_ADJUVANT_RULES.differentiated;
    } else if (input.histology === 'MTC') {
        ruleset = THYROID_ADJUVANT_RULES.medullary;
    } else if (input.histology === 'ATC') {
        ruleset = THYROID_ADJUVANT_RULES.anaplastic;
    }

    for (const rule of ruleset) {
        if (rule.when_all && rule.when_all.every((cond: any) => evaluateCondition(cond, input))) {
            const notes = [];
            if (input.histology.startsWith('DTC')) {
                notes.push(THYROID_ADJUVANT_RULES.timing_notes.tsh);
                 if (rule.recommendation.includes('RAI')) {
                    notes.push(THYROID_ADJUVANT_RULES.timing_notes.rai);
                 }
            }
            if (input.patient?.rai_contraindicated && rule.recommendation.includes('RAI')) {
                notes.push('RAI is contraindicated in this patient.');
            }

            return {
                plan: rule.recommendation,
                explain: rule.rationale,
                notes: notes.length > 0 ? notes : undefined,
            };
        }
    }

    return {
        plan: "No specific recommendation found",
        explain: "The patient's parameters did not match a specific rule. Please review manually or with MDT.",
    };
};
