export const TSH_INITIAL_GATING = {
    module: "TSH_INITIAL_GATING_V1",
    version: "1.0.0",
    description: "Initial triage. Decides scan necessity and urgent referral triggers.",
    inputs: ["tsh_value_miu_l", "tsh_status", "red_flags", "pregnant", "lactating"],
    rules: [
        {
            id: "URGENT_RED_FLAGS",
            priority: 1000,
            when: { red_flags_present: true },
            then: {
                action: "URGENT_REFERRAL",
                next_steps: ["order_neck_ultrasound", "enable_scan_workflow_if_tsh_low"],
                reason: "Clinical red flags (voice change, rapid growth, hard mass) require expedited workup."
            }
        },
        {
            id: "LOW_TSH_SCAN_PATHWAY",
            priority: 800,
            when: { tsh_status: "LOW_OR_SUPPRESSED", pregnant: false },
            then: {
                action: "SCAN_PATHWAY_AVAILABLE",
                next_steps: ["order_radionuclide_scan", "proceed_to_us_module"],
                reason: "Suppressed TSH requires functional scan to rule out toxic adenoma/TMNG before biopsy."
            }
        },
        {
            id: "NORMAL_HIGH_TSH",
            priority: 700,
            when: { tsh_status: ["NORMAL", "HIGH", "UNKNOWN"] },
            then: {
                action: "PROCEED_TO_ULTRASOUND",
                next_steps: ["disable_scan_workflow"],
                reason: "Scan not indicated. Proceed to anatomic risk stratification (US)."
            }
        }
    ]
};
