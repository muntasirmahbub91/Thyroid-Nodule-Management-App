// Dr Muntasir's Thyroid Cancer Management App — Module Logic
export const THYROID_UPSTAGE_RULES = {
    "version": "thyroid_upstage_rules_v1.0",
    "rules": [
        {
            "when_all": [
                { "eq": ["post_op_histology.final_histology", "NIFTP"] }
            ],
            "action": "SURVEILLANCE_ONLY",
            "why": "Final pathology is NIFTP, which is managed like a benign entity. No completion thyroidectomy or RAI is indicated. Continue routine surveillance.",
            "proceed_to_management": false
        },
        {
            "when_all": [
                { "in": ["post_op_histology.final_histology", ["FTC", "Oncocytic"]] },
                { "eq": ["post_op_histology.widely_invasive", false] },
                { "in": ["post_op_histology.vascular_invasion_vessels", ["none", "1-3"]] }
            ],
            "action": "SURVEILLANCE_ONLY",
            "why": "Final pathology is minimally invasive FTC or Oncocytic carcinoma without significant vascular invasion (fewer than 4 vessels). Lobectomy is considered sufficient treatment.",
            "proceed_to_management": false
        },
        {
            "when_any": [
                { "eq": ["post_op_histology.margin_status", "positive"] },
                { "eq": ["post_op_histology.gross_ETE", true] },
                { "and": [
                    { "in": ["post_op_histology.final_histology", ["FTC", "Oncocytic"]] },
                    { "eq": ["post_op_histology.vascular_invasion_vessels", ">=4"] }
                ]},
                { "and": [
                    { "in": ["post_op_histology.final_histology", ["FTC", "Oncocytic"]] },
                    { "eq": ["post_op_histology.widely_invasive", true] }
                ]},
                { "eq": ["post_op_histology.nodes_path_positive", true] }
            ],
            "action": "RECOMMEND_COMPLETION_TT",
            "why": "High-risk features found on final pathology (e.g., positive margin, gross ETE, extensive vascular invasion, positive nodes) warrant completion thyroidectomy to ensure oncologic control and enable adjuvant therapy if needed.",
            "proceed_to_management": true
        }
    ]
};
