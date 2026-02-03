export const US_TO_FNAC_DECISION = {
    module: "US_TO_FNAC_DECISION_TOGGLEABLE_V1",
    version: "1.0.0",
    description: "Applies size & pattern thresholds to recommend FNAC or Surveillance.",
    inputs: ["us_system", "nodules", "suspicious_cervical_nodes"],
    rules: [
        {
            id: "NODE_FNA_OVERRIDE",
            priority: 1000,
            when: { suspicious_cervical_nodes: true },
            then: {
                node_fna: true,
                action: "FNA_NODE",
                reason: "Suspicious lymph nodes require biopsy regardless of nodule size."
            }
        },
        {
            id: "ATA_HIGH_FNA",
            priority: 730,
            when: { system: "ATA_2015", pattern: "HIGH", size_cm: ">= 1.0" },
            then: { action: "FNA", reason: "High suspicion nodule ≥ 1.0cm" }
        },
        {
            id: "ATA_INTERMEDIATE_FNA",
            priority: 750,
            when: { system: "ATA_2015", pattern: "INTERMEDIATE", size_cm: ">= 1.0" },
            then: { action: "FNA", reason: "Intermediate suspicion nodule ≥ 1.0cm" }
        },
        {
            id: "ATA_LOW_FNA",
            priority: 770,
            when: { system: "ATA_2015", pattern: "LOW", size_cm: ">= 1.5" },
            then: { action: "FNA", reason: "Low suspicion nodule ≥ 1.5cm" }
        },
        {
            id: "ATA_VERY_LOW_FNA",
            priority: 790,
            when: { system: "ATA_2015", pattern: "VERY_LOW", size_cm: ">= 2.0" },
            then: { action: "CONSIDER_FNA", reason: "Very low suspicion nodule ≥ 2.0cm (Observational approach also reasonable)" }
        },
        {
            id: "ACR_TR5_FNA",
            priority: 610,
            when: { system: "ACR_TI_RADS_2017", pattern: "TR5", size_cm: ">= 1.0" },
            then: { action: "FNA", reason: "TR5 nodule ≥ 1.0cm" }
        },
        {
            id: "ACR_TR4_FNA",
            priority: 640,
            when: { system: "ACR_TI_RADS_2017", pattern: "TR4", size_cm: ">= 1.5" },
            then: { action: "FNA", reason: "TR4 nodule ≥ 1.5cm" }
        },
        {
            id: "ACR_TR3_FNA",
            priority: 670,
            when: { system: "ACR_TI_RADS_2017", pattern: "TR3", size_cm: ">= 2.5" },
            then: { action: "FNA", reason: "TR3 nodule ≥ 2.5cm" }
        },
        {
            id: "ACR_TR2_OBSERVE",
            priority: 590,
            when: { system: "ACR_TI_RADS_2017", pattern: "TR2" },
            then: { action: "NO_FNA_SURVEILLANCE", reason: "TR2 (Not Suspicious) — No FNA recommended regardless of size. Surveillance optional." }
        },
        {
            id: "ACR_TR1_BENIGN",
            priority: 580,
            when: { system: "ACR_TI_RADS_2017", pattern: "TR1" },
            then: { action: "NO_FNA_BENIGN", reason: "TR1 (Benign) — Cyst or spongiform nodule. No FNA needed." }
        }
    ]
};
