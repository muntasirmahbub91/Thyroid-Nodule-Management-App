export const LOW_TSH_SCAN_OVERRIDE = {
    module: "LOW_TSH_SCAN_OVERRIDE_V1",
    version: "1.0.0",
    description: "Prevents unnecessary biopsy of hot nodules.",
    inputs: ["tsh_status", "scan_pattern", "concordance", "us_risk"],
    rules: [
        {
            id: "HOT_NODULE_SKIP_FNA",
            priority: 900,
            when: {
                tsh_status: "LOW_OR_SUPPRESSED",
                scan_pattern: "HOT",
                concordance: "MATCH"
            },
            then: {
                override_fna: true,
                next_module: "HYPERTHYROID_TREATMENT_SELECTOR",
                reason: "Nodule is hyperfunctioning (Hot). Malignancy risk is negligible. Do not biopsy."
            }
        },
        {
            id: "HOT_NODULE_DISCORDANCE",
            priority: 890,
            when: {
                scan_pattern: "HOT",
                concordance: "MISMATCH"
            },
            then: {
                override_fna: false,
                reason: "Scan hot spot does not match US nodule. Treat US nodule as Cold/Indeterminate. Proceed to FNA if size criteria met."
            }
        },
        {
            id: "COLD_NODULE_ROUTE",
            priority: 850,
            when: { scan_pattern: "COLD" },
            then: {
                override_fna: false,
                reason: "Nodule is cold. Risk of malignancy exists. Follow standard US FNA criteria."
            }
        }
    ]
};
