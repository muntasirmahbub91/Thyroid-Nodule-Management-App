// Dr Muntasir's Thyroid Cancer Management App — Module Logic
export const INITIAL_TREATMENT_RULES = {
  "version": "thyroid_neck_surgery_rules_v2.0_user_dataset_aligned",
  "thyroid_surgery": [
    {
      "when_all": [
        { "eq": ["histology", "MTC"], "reason": "Medullary histology" },
        { "eq": ["distant_mets", true], "reason": "Distant metastasis present" }
      ],
      "surgery": "SYSTEMIC_THERAPY_MTC",
      "label": "Systemic Therapy (Metastatic MTC)",
      "explain": "For metastatic medullary thyroid cancer, systemic therapy is the primary treatment. Surgical resection of the primary tumor may be considered for local control but is not curative. The choice of systemic agent depends on RET mutation status."
    },
    {
      "when_all": [
        { "in": ["histology", ["ATC"]], "reason": "Anaplastic histology" },
        { "eq": ["distant_mets", false], "reason": "No distant metastasis" },
        { "not": { "in": ["gross_ETE_planes", ["prevertebral","carotid/mediastinal"]] }, "reason": "Tumor is considered resectable" }
      ],
      "surgery": "TOTAL_THYROIDECTOMY_EN_BLOC_AS_FEASIBLE",
      "label": "Total Thyroidectomy (Resectable ATC)",
      "explain": "For resectable, non-metastatic anaplastic carcinoma (Stage IVA/IVB), aggressive surgical resection (en bloc total thyroidectomy) is recommended as part of a multimodality treatment approach, often including neoadjuvant targeted therapy and/or adjuvant radiation."
    },
     {
      "when_all": [
        { "eq": ["histology", "MTC"], "reason": "Medullary histology" },
        { "eq": ["distant_mets", false], "reason": "No distant metastasis" }
      ],
      "surgery": "TOTAL_THYROIDECTOMY_MTC",
      "label": "Total Thyroidectomy (for MTC)",
      "explain": "Total thyroidectomy is the standard of care for all non-metastatic medullary thyroid carcinomas, regardless of tumor size, to ensure complete removal of C-cell disease. A central neck dissection is typically performed concurrently."
    },
    {
      "when_any": [
        { "and": [
          { "in": ["histology", ["DTC_papillary","DTC_follicular","DTC_oncocytic"]] },
          { "or": [
            { "in": ["gross_ETE_planes", ["strap","subcut","larynx","trachea","esophagus","RLN","prevertebral","carotid/mediastinal"]], "reason": "Gross extrathyroidal extension" },
            { "in": ["cN_pattern", ["N1a","N1b"]], "reason": "Clinically positive nodes" },
            { ">": ["size_cm", 4.0], "reason": "Tumor size > 4 cm" },
            { "eq": ["distant_mets", true], "reason": "Distant metastases present" },
            { "eq": ["high_risk_variant", true], "reason": "High-risk histologic variant" }
          ] }
        ] }
      ],
      "surgery": "TOTAL_THYROIDECTOMY",
      "label": "Total Thyroidectomy (for DTC)",
      "explain": "Total thyroidectomy is recommended for differentiated thyroid cancer with high-risk features, including tumors >4 cm, clinical nodal involvement, distant metastases, or gross extrathyroidal extension. This approach facilitates adjuvant RAI therapy and simplifies long-term surveillance."
    },
    {
      "when_all": [
        { "in": ["histology", ["DTC_papillary","DTC_follicular","DTC_oncocytic"]], "reason": "Differentiated thyroid cancer" },
        { "between": ["size_cm", 1.0, 4.0], "reason": "Tumor size is 1-4 cm" },
        { "eq": ["cN_pattern", "N0"], "reason": "Clinically node-negative (cN0)" },
        { "empty_or_absent": ["gross_ETE_planes"], "reason": "No gross extrathyroidal extension" }
      ],
      "surgery": "THYROID_LOBECTOMY",
      "label": "Thyroid Lobectomy",
      "explain": "For differentiated thyroid cancer between 1-4 cm without clinical node involvement or extrathyroidal extension, a thyroid lobectomy is often the preferred surgical approach, balancing oncologic control with preservation of thyroid function."
    },
    {
      "when_all": [
        { "eq": ["index_surgery", "lobectomy"], "reason": "Patient had prior lobectomy" },
        { "in": ["histology", ["DTC_papillary","DTC_follicular","DTC_oncocytic"]] },
        { "or": [
          { ">": ["size_cm", 4.0], "reason": "Final pathology size > 4 cm" },
          { "eq": ["lymphatic_invasion", true], "reason": "Lymphatic invasion found" },
          { "eq": ["vascular_invasion", true], "reason": "Vascular invasion found" },
          { "eq": ["multifocal_macroscopic", true], "reason": "Macroscopic multifocal disease" },
          { "eq": ["high_risk_variant", true], "reason": "High-risk histologic variant found" },
          { "eq": ["margins_positive", true], "reason": "Positive margins on final pathology" }
        ] }
      ],
      "surgery": "COMPLETION_THYROIDECTOMY",
      "label": "Completion Thyroidectomy",
      "explain": "Following a diagnostic lobectomy, the presence of high-risk features on final pathology warrants a completion thyroidectomy to ensure complete tumor removal, facilitate potential adjuvant therapy (RAI), and simplify surveillance."
    },
    {
      "when_all": [
        { "eq": ["histology", "DTC_papillary"], "reason": "Papillary thyroid microcarcinoma" },
        { "<=": ["size_cm", 1.0], "reason": "Tumor size ≤ 1 cm" },
        { "eq": ["cN_pattern", "N0"], "reason": "Clinically node-negative (cN0)" },
        { "empty_or_absent": ["gross_ETE_planes"], "reason": "No gross extrathyroidal extension" }
      ],
      "surgery": "ACTIVE_SURVEILLANCE_OR_LOBECTOMY",
      "label": "Active Surveillance or Lobectomy",
      "explain": "For low-risk papillary microcarcinoma (≤1 cm, intrathyroidal, node-negative), active surveillance is a valid alternative to immediate surgery (lobectomy). The decision should be shared between the clinician and a well-informed patient."
    }
  ],
  "neck_surgery": [
    {
      "when_all": [
        { "in": ["histology", ["DTC_papillary","DTC_follicular","DTC_oncocytic"]], "reason": "Differentiated thyroid cancer" },
        { "eq": ["cN_pattern", "N1a"], "reason": "Clinically positive central nodes (cN1a)" }
      ],
      "surgery": "CENTRAL_NECK_DISSECTION_LEVEL_VI_±_VII",
      "levels": ["VI", "±VII"],
      "label": "Therapeutic Central Neck Dissection (Level VI)",
      "explain": "For patients with clinically involved central neck lymph nodes (cN1a), a therapeutic compartment-oriented central neck dissection (level VI) is required. Level VII is included if there is evidence of disease extension."
    },
    {
      "when_all": [
        { "in": ["histology", ["DTC_papillary","DTC_follicular","DTC_oncocytic"]], "reason": "Differentiated thyroid cancer" },
        { "eq": ["cN_pattern", "N0"], "reason": "Clinically node-negative (cN0)" }
      ],
      "surgery": "NO_PROPHYLACTIC_CENTRAL",
      "label": "No Routine Prophylactic Neck Dissection",
      "explain": "Prophylactic central neck dissection is not routinely recommended for patients with clinically node-negative (cN0) differentiated thyroid cancer, as it has not been shown to improve survival and carries risk to parathyroid glands and recurrent laryngeal nerves."
    },
    {
      "when_all": [
        { "in": ["histology", ["DTC_papillary","DTC_follicular","DTC_oncocytic"]], "reason": "Differentiated thyroid cancer" },
        { "eq": ["cN_pattern", "N1b"], "reason": "Clinically positive lateral nodes (cN1b)" }
      ],
      "surgery": "LATERAL_SND_II_TO_IV_±V",
      "levels": ["IIa","III","IV","±Vb"],
      "label": "Therapeutic Lateral Neck Dissection",
      "explain": "For clinically involved lateral neck nodes (cN1b), a therapeutic selective neck dissection of the involved compartments (typically levels II-IV) is indicated. A central neck dissection should also be performed."
    },
    {
      "when_all": [
        { "eq": ["histology", "MTC"], "reason": "Medullary histology" },
        { "eq": ["cN_pattern", "N0"], "reason": "Clinically node-negative" }
      ],
      "surgery": "CENTRAL_VI_PROPHYLACTIC",
      "levels": ["VI"],
      "label": "Prophylactic Central Neck Dissection (Level VI)",
      "explain": "Due to the high rate of occult central neck metastases in MTC, a bilateral prophylactic central compartment (level VI) neck dissection is standard of care, even in clinically node-negative patients. CRITICAL: Pheochromocytoma must be ruled out pre-operatively."
    },
    {
      "when_all": [
        { "eq": ["histology", "MTC"], "reason": "Medullary histology" },
        { "eq": ["cN_pattern", "N1a"], "reason": "Clinically positive central nodes" }
      ],
      "surgery": "CENTRAL_VI_THERAPEUTIC_MTC",
      "levels": ["VI"],
      "label": "Therapeutic Central Neck Dissection (Level VI)",
      "explain": "For MTC with clinically involved central nodes, a therapeutic bilateral central neck dissection is performed. Consider prophylactic ipsilateral lateral dissection for high-volume central disease. CRITICAL: Rule out pheochromocytoma pre-op."
    },
    {
      "when_all": [
        { "eq": ["histology", "MTC"], "reason": "Medullary histology" },
        { "eq": ["lateral_nodes_involved", true], "reason": "Clinically positive lateral nodes" }
      ],
      "surgery": "LATERAL_THERAPEUTIC_II_TO_V",
      "levels": ["II","III","IV","V"],
      "label": "Therapeutic Lateral & Central Neck Dissection",
      "explain": "In MTC with clinically positive lateral neck nodes, a comprehensive neck dissection including both the central compartment and the involved lateral compartments is necessary. CRITICAL: Rule out pheochromocytoma pre-op."
    },
    {
      "when_all": [
        { "eq": ["histology", "ATC"], "reason": "Anaplastic histology" },
        { "eq": ["distant_mets", false], "reason": "No distant metastasis" }
      ],
      "surgery": "THERAPEUTIC_ONLY_WHEN_CLEARABLE",
      "label": "Therapeutic Neck Dissection Only",
      "explain": "For anaplastic carcinoma, neck dissection is performed for therapeutic intent only (i.e., for bulky, resectable disease) and not for prophylactic purposes."
    },
    {
      "when_all": [
        { "eq": ["level_VII_nodes_involved", true], "reason": "Level VII nodes involved" }
      ],
      "surgery": "SUPERIOR_MEDIASTINAL_LEVEL_VII_DISSECTION",
      "levels": ["VII"],
      "label": "Superior Mediastinal Dissection (Level VII)",
      "explain": "When there is clinical or radiographic evidence of metastasis to the superior mediastinal lymph nodes (level VII), this compartment should be included in the neck dissection, which may require a thoracic approach."
    }
  ]
}