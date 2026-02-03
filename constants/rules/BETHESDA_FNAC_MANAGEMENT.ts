export const BETHESDA_FNAC_MANAGEMENT = {
    module: "BETHESDA_FNAC_MANAGEMENT_V1",
    version: "1.0.0",
    inputs: ["bethesda_category", "prior_nondiagnostic_count", "molecular_available"],
    rules: [
        {
            id: "BETHESDA_I_REPEAT",
            priority: 900,
            when: { bethesda_category: "I", prior_nondiagnostic_count: 0 },
            then: { action: "REPEAT_FNAC", reason: "Insufficient sample." }
        },
        {
            id: "BETHESDA_II_OBSERVE",
            priority: 850,
            when: { bethesda_category: "II" },
            then: { action: "OBSERVE_US_SURVEILLANCE", reason: "Benign cytology." }
        },
        {
            id: "BETHESDA_III_MOLECULAR",
            priority: 800,
            when: { bethesda_category: "III" },
            then: {
                primary: "REPEAT_FNAC",
                secondary: "CONSIDER_MOLECULAR_TESTING",
                reason: "Atypia of Undetermined Significance."
            }
        },
        {
            id: "BETHESDA_IV_LOBECTOMY",
            priority: 750,
            when: { bethesda_category: "IV" },
            then: {
                primary: "DIAGNOSTIC_LOBECTOMY",
                secondary: "CONSIDER_MOLECULAR_TESTING",
                reason: "Follicular Neoplasm. Cytology cannot determine invasion. Surgery or molecular testing recommended."
            }
        },
        {
            id: "BETHESDA_V_SURGERY",
            priority: 700,
            when: { bethesda_category: "V" },
            then: {
                action: "SURGERY_PATHWAY",
                next_module: "SURGERY_EXTENT_AND_NECK_MANAGEMENT",
                reason: "Suspicious for malignancy (~75% risk). Surgery recommended."
            }
        },
        {
            id: "BETHESDA_VI_SURGERY",
            priority: 650,
            when: { bethesda_category: "VI" },
            then: {
                action: "DEFINITIVE_SURGERY_PATHWAY",
                next_module: "SURGERY_EXTENT_AND_NECK_MANAGEMENT",
                reason: "Malignancy confirmed."
            }
        }
    ]
};
