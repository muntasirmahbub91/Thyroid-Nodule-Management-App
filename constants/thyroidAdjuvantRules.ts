// Dr Muntasir's Thyroid Cancer Management App — Module Logic
// Adjuvant therapy rules based on ATA 2015 / NCCN 2025 / BTA 2017 guidelines.

type AdjuvantRule = {
    id: string;
    title: string;
    when_all: any[];
    recommendation: string;
    rationale: string;
    notes?: { if?: any; text: string }[];
};

type AdjuvantRuleSet = {
    differentiated: AdjuvantRule[];
    medullary: AdjuvantRule[];
    anaplastic: AdjuvantRule[];
    timing_notes: {
        rai: string;
        tsh: string;
    };
};

export const THYROID_ADJUVANT_RULES: AdjuvantRuleSet = {
    timing_notes: {
        rai: "RAI is administered post-recovery with TSH stimulation and low-iodine diet per protocol.",
        tsh: "Typical TSH targets: Low-risk 0.5–2; Intermediate 0.1–0.5; High-risk <0.1."
    },
    differentiated: [
        {
            id: "lobectomy_completion",
            title: "Completion Thyroidectomy Considered",
            when_all: [
                { "eq": ["index_surgery","lobectomy"] },
                { "or": [
                    { ">": ["largest_focus_cm", 4.0] }, { "eq": ["lymphatic_invasion", true] },
                    { "eq": ["vascular_invasion", true] }, { "eq": ["multifocal_macroscopic", true] },
                    { "eq": ["hist_variant_high_risk", true] }, { "eq": ["gross_ETE", true] },
                    { "in": ["margin_status", ["close", "positive"]] },
                    { "in": ["N_pattern", ["N1a_micro", "N1a", "N1b"]] }
                ] }
            ],
            recommendation: "Consider completion thyroidectomy before adjuvant therapy; reassess risk after total resection.",
            rationale: "Post-lobectomy adverse features suggest higher risk. Completion thyroidectomy allows for full staging and facilitates RAI for higher-risk disease."
        },
        {
            id: "lobectomy_surveillance",
            title: "Observation / TSH Suppression Only",
            when_all: [{ "eq": ["index_surgery", "lobectomy"] }],
            recommendation: "Observation and TSH suppression; no RAI possible after lobectomy.",
            rationale: "For low to intermediate-risk DTC without high-risk features on final pathology, lobectomy is considered sufficient treatment. Active surveillance with neck US and thyroglobulin is recommended."
        },
        {
            id: "low_risk_no_RAI",
            title: "No Adjuvant Therapy Needed (Low Risk)",
            when_all: [
                { "eq": ["index_surgery","total_thyroidectomy"] }, { "<=": ["largest_focus_cm", 2.0] },
                { "eq": ["gross_ETE", false] }, { "in": ["N_pattern", ["N0","N1a_tiny"]] },
                { "eq": ["tg_ab", false] }, { "<": ["tg_unstim_ng_ml", 1.0] },
                { "eq": ["neck_ultrasound_negative", true] }
            ],
            recommendation: "TSH suppression to 0.1–0.5 mIU/L. No radioiodine ablation indicated.",
            rationale: "Low-risk differentiated carcinoma has recurrence <5%; RAI offers no survival benefit."
        },
        {
            id: "intermediate_selective_RAI",
            title: "Selective RAI Ablation (Intermediate Risk)",
            when_all: [
                { "eq": ["index_surgery", "total_thyroidectomy"] },
                { "or": [
                    { ">": ["largest_focus_cm", 4.0] }, { "eq": ["hist_variant_high_risk", true] },
                    { "eq": ["lymphatic_invasion", true] }, { "eq": ["multifocal_macroscopic", true] },
                    { "and": [{ ">=": ["tg_unstim_ng_ml", 1.0] }, { "<": ["tg_unstim_ng_ml", 10.0] }] },
                    { "eq": ["margin_status","close"] }, { "eq": ["N_pattern","N1a_micro"] }
                ]}
            ],
            recommendation: "Consider RAI 30–100 mCi for remnant ablation; TSH suppression 0.1–0.5 mIU/L.",
            rationale: "Intermediate-risk patients may benefit from selective ablation for improved recurrence monitoring and reduced regional relapse."
        },
        {
            id: "high_risk_routine_RAI",
            title: "Routine RAI Ablation (High Risk)",
            when_all: [
                { "eq": ["index_surgery", "total_thyroidectomy"] },
                { "or": [
                    { "eq": ["N_pattern","N1b"] }, { "eq": ["gross_ETE", true] },
                    { ">=": ["tg_unstim_ng_ml", 10.0] }, { ">=": ["nodes_positive_count", 5] },
                    { "eq": ["vascular_invasion", true] }, { "eq": ["differentiated_high_grade", true] },
                    { "eq": ["margin_status", "positive"] }
                ]}
            ],
            recommendation: "Adjuvant RAI 100–200 mCi after total thyroidectomy; TSH suppression <0.1 mIU/L.",
            rationale: "High-risk differentiated thyroid carcinoma benefits from routine RAI to reduce recurrence and disease-specific mortality."
        },
    ],
    medullary: [
        {
            id: "MTC_EBRT",
            title: "EBRT Consideration",
            when_all: [
                { "or": [
                    { "eq": ["margin_status_mtc","positive"] }, { "eq": ["gross_residual", true] }
                ]}
            ],
            recommendation: "Consider EBRT 60 Gy to neck/mediastinum to reduce locoregional recurrence.",
            rationale: "EBRT improves local control when surgical margins are close or residual microscopic disease persists and re-resection is not feasible."
        },
        {
            id: "MTC_no_adjuvant",
            title: "No Adjuvant Therapy Indicated",
            when_all: [{ "eq": ["margin_status_mtc","negative"] }],
            recommendation: "Observation and serum calcitonin monitoring every 6–12 months.",
            rationale: "MTC does not uptake iodine; RAI is ineffective. Primary adjuvant management is biochemical surveillance. TSH suppression is not indicated."
        }
    ],
    anaplastic: [
         {
            id: "ATC_combined",
            title: "Combined Modality Therapy",
            when_all: [
                { "in": ["stage_group", ["IVA","IVB"]] },
                { "eq": ["resectable", true] }
            ],
            recommendation: "Concurrent chemoradiation (60 Gy + weekly paclitaxel/carboplatin); consider adjuvant therapy trials.",
            rationale: "Aggressive adjuvant management improves local control and short-term survival in resectable ATC."
        },
    ]
};
