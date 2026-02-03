// Dr Muntasir's Thyroid Cancer Management App — Rule Engine Logic

export interface RuleModule {
    module: string;
    version: string;
    description: string;
    inputs: string[];
    rules: Rule[];
}

export interface Rule {
    id: string;
    priority: number;
    when?: any;
    when_all?: any;
    when_any?: any;
    then: RuleEffect;
}

export interface RuleEffect {
    action?: string;
    next_steps?: string[];
    reason?: string;
    // Dynamic fields
    [key: string]: any;
}

export class RuleEngine {

    public static evaluate(module: RuleModule, context: any): RuleEffect | null {
        // Sort rules by priority (descending)
        const sortedRules = [...module.rules].sort((a, b) => b.priority - a.priority);

        for (const rule of sortedRules) {
            if (this.evaluateRule(rule, context)) {
                return rule.then;
            }
        }

        return null;
    }

    private static evaluateRule(rule: Rule, context: any): boolean {
        if (rule.when) {
            return this.evaluateCondition(rule.when, context);
        }
        if (rule.when_all) {
            // If when_all is an array of conditions object, or a single condition object with multiple keys
            if (Array.isArray(rule.when_all)) {
                return rule.when_all.every((cond: any) => this.evaluateCondition(cond, context));
            }
            // Handle object format { key1: val1, key2: val2 } implicitly as AND
            return this.evaluateCondition(rule.when_all, context);
        }
        if (rule.when_any) {
            if (Array.isArray(rule.when_any)) {
                return rule.when_any.some((cond: any) => this.evaluateCondition(cond, context));
            }
            // This case is ambiguous for a single object, but we'll treat keys as OR if needed, 
            // though normally when_any expects an array of discrete conditions.
            // For strict alignment with our JSON structure:
            return Object.keys(rule.when_any).some(key => this.evaluateCondition({ [key]: rule.when_any[key] }, context));
        }
        return false;
    }

    private static evaluateCondition(condition: any, context: any): boolean {
        // Simple key-value match: { "tsh_status": "LOW" }
        // Complex operator: { "size_cm": ">= 1.0" }
        // Nested logic: { "or": [...] }

        return Object.entries(condition).every(([key, value]) => {
            if (key === 'or') {
                return (value as any[]).some(subCond => this.evaluateCondition(subCond, context));
            }
            if (key === 'and') {
                return (value as any[]).every(subCond => this.evaluateCondition(subCond, context));
            }
            if (key === 'not') {
                return !this.evaluateCondition(value, context);
            }
            if (key === 'any') { // Synonymous with OR for array of conditions
                return (value as any[]).some(subCond => this.evaluateCondition(subCond, context));
            }


            // Resolve data path (e.g., "clinical.red_flags")
            const contextValue = this.resolvePath(key, context);

            // Handle operators in value string
            if (typeof value === 'string') {
                if (value.startsWith('>=')) {
                    return typeof contextValue === 'number' && contextValue >= parseFloat(value.substring(2));
                }
                if (value.startsWith('<=')) {
                    return typeof contextValue === 'number' && contextValue <= parseFloat(value.substring(2));
                }
                if (value.startsWith('>')) {
                    return typeof contextValue === 'number' && contextValue > parseFloat(value.substring(1));
                }
                if (value.startsWith('<')) {
                    return typeof contextValue === 'number' && contextValue < parseFloat(value.substring(1));
                }
            }

            // Array inclusion check (is value in array?)
            if (Array.isArray(value)) {
                return value.includes(contextValue);
            }

            // Boolean/String exact match
            return contextValue === value;
        });
    }

    private static resolvePath(path: string, obj: any): any {
        // 1. Try direct property access on flattened context helper
        if (obj[path] !== undefined) return obj[path];

        // 2. Try simple traversal
        return path.split('.').reduce((p, c) => (p && p[c] !== undefined) ? p[c] : undefined, obj);
    }
}
