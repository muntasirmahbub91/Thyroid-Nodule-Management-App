// Dr Muntasir's Thyroid Cancer Management App — Module Logic
import { CaseInput, TreatmentOutput, TreatmentRecommendation } from '../types';
import { INITIAL_TREATMENT_RULES } from '../constants/initialTreatmentRules';

type Rule = {
    when_all?: any[];
    when_any?: any[];
    surgery: string;
    label: string;
    explain: string;
    variants?: any[];
    [key: string]: any;
};

type RuleMatch = {
    rule: Rule;
    reasons: string[];
}

export class TreatmentEngine {

    public computeInitial(input: CaseInput): TreatmentOutput {
        const thyroidMatch = this.findRecommendation(INITIAL_TREATMENT_RULES.thyroid_surgery, input);
        const neckMatch = this.findRecommendation(INITIAL_TREATMENT_RULES.neck_surgery, input);
        
        const formatRecommendation = (match: RuleMatch | undefined): TreatmentRecommendation | undefined => {
            if (!match) return undefined;
            
            return {
                plan_id: match.rule.surgery,
                label: match.rule.label,
                rationale: match.rule.explain,
                indications: [...new Set(match.reasons)], // Use a Set to ensure reasons are unique
            };
        };

        return { 
            thyroidSurgery: formatRecommendation(thyroidMatch),
            neckSurgery: formatRecommendation(neckMatch),
        };
    }

    private findRecommendation(rules: Rule[], input: CaseInput): RuleMatch | undefined {
        for (const rule of rules) {
            const { match, reasons } = this.evaluateRule(rule, input);
            if (match) {
                return { rule, reasons };
            }
        }
        return undefined;
    }

    private evaluateRule(rule: Rule, input: CaseInput): { match: boolean; reasons: string[] } {
        if (rule.when_all) {
            const results = rule.when_all.map(cond => this.evaluateConditionWithReasons(cond, input));
            const allMatch = results.every(r => r.match);
            if (allMatch) {
                const reasons = results.flatMap(r => r.reasons);
                return { match: true, reasons: [...new Set(reasons)] };
            }
        }
        if (rule.when_any) {
            const results = rule.when_any.map(cond => this.evaluateConditionWithReasons(cond, input));
            const anyMatch = results.some(r => r.match);
            if (anyMatch) {
                const reasons = results.filter(r => r.match).flatMap(r => r.reasons);
                return { match: true, reasons: [...new Set(reasons)] };
            }
        }
        return { match: false, reasons: [] };
    }

    private evaluateConditionWithReasons(condition: any, input: CaseInput): { match: boolean; reasons: string[] } {
        const key = Object.keys(condition).find(k => k !== 'reason');
        if (!key) return { match: false, reasons: [] };
    
        const args = condition[key];
        const reason = condition['reason'];
        
        if (key === 'and') {
            const results = (args as any[]).map(cond => this.evaluateConditionWithReasons(cond, input));
            const allMatch = results.every(r => r.match);
            if (allMatch) {
                const reasons = results.flatMap(r => r.reasons);
                if (reason) reasons.unshift(reason);
                return { match: true, reasons };
            }
            return { match: false, reasons: [] };
    
        } else if (key === 'or') {
            const results = (args as any[]).map(cond => this.evaluateConditionWithReasons(cond, input));
            const anyMatch = results.some(r => r.match);
            if (anyMatch) {
                const reasons = results.filter(r => r.match).flatMap(r => r.reasons);
                if (reason) reasons.unshift(reason);
                return { match: true, reasons };
            }
            return { match: false, reasons: [] };
        
        } else if (key === 'not') {
            const result = this.evaluateConditionWithReasons(args, input);
            if (!result.match) {
                return { match: true, reasons: reason ? [reason] : [] };
            }
            return { match: false, reasons: [] };
        }
    
        // Simple condition evaluated by the old method
        const match = this.evaluateCondition(condition, input); 
        if (match) {
            return { match: true, reasons: reason ? [reason] : [] };
        }
        
        return { match: false, reasons: [] };
    }

    private evaluateCondition(condition: any, input: CaseInput): boolean {
        const key = Object.keys(condition).find(k => k !== 'reason');
        if (!key) return false;
        
        const args = condition[key];

        const value = this.getInputValue(args[0], input);

        switch (key) {
            case 'eq':
                return value === args[1];
            case 'in':
                return Array.isArray(value) ? value.some(v => args[1].includes(v)) : args[1].includes(value);
            case 'not':
                 return !this.evaluateCondition(args, input);
            case 'and':
                return Array.isArray(args) && args.every(cond => this.evaluateCondition(cond, input));
            case 'or':
                return Array.isArray(args) && args.some(cond => this.evaluateCondition(cond, input));
            case '>':
                return typeof value === 'number' && value > args[1];
            case '<=':
                 return typeof value === 'number' && value <= args[1];
            case 'between':
                return typeof value === 'number' && value >= args[1] && value <= args[2];
            case 'empty_or_absent':
                return value === undefined || value === null || (Array.isArray(value) && value.length === 0);
            default:
                return false;
        }
    }

    private getInputValue(path: string, input: CaseInput): any {
        switch (path) {
            case 'histology': return input.histology;
            case 'size_cm': return input.primary?.size_cm?.value;
            case 'distant_mets': return input.metastasis?.confirmed ?? false;
            case 'gross_ETE_planes': return input.primary?.grossEtePlanes;
            case 'cN_pattern': return input.staging?.N;
            case 'invasion_SAN_or_IJV_or_SCM': return input.nodes?.invasion_of_critical_structures;
            case 'index_surgery': return input.index_surgery;
            case 'lymphatic_invasion': return input.lymphatic_invasion;
            case 'vascular_invasion': return input.vascular_invasion;
            case 'multifocal_macroscopic': return input.multifocal_macroscopic;
            case 'high_risk_variant': return input.hist_variant_high_risk;
            case 'margins_positive': return input.margin_status === 'positive';
            case 'lateral_nodes_involved': return input.nodes?.levels?.lateral_neck_or_retropharyngeal;
            case 'level_VII_nodes_involved': return input.nodes?.levels?.level_vi_vii;
            default: return undefined;
        }
    }
}