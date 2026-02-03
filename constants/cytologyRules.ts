// Dr Muntasir's Thyroid Cancer Management App — Module Logic
// ============================================================================
// constants/cytologyRules.ts
// Post-FNA (Cytology) Management Rules for Thyroid Nodules
// Implements Bethesda (ATA) and RCPath/Thy (BTA) systems.
// ============================================================================

export const CYTOLOGY_RULES = {
  "version": "cytology_rules_v1.1_handoff_update",
  "post_fna_actions": {
    "Bethesda": [{
      "cat": "I",
      "action": "REPEAT_US_GUIDED_FNA",
      "why": "Nondiagnostic (Bethesda I). The sample is insufficient for diagnosis. Repeat US-guided FNA is recommended."
    }, {
      "cat": "II",
      "action": "US_SURVEILLANCE",
      "interval_months": "12-24",
      "why": "Benign (Bethesda II). Follow-up with ultrasound is recommended. Repeat FNA only if significant growth or new suspicious features are seen."
    }, {
      "cat": "III",
      "action": "REPEAT_FNA_OR_CNB_±_MOLECULAR",
      "why": "AUS/FLUS (Bethesda III). This is an indeterminate result. Options include repeat FNA, core biopsy, molecular testing, or diagnostic lobectomy based on US risk and clinical judgment."
    }, {
      "cat": "IV",
      "action": "DIAGNOSTIC_LOBECTOMY",
      "why": "Follicular Neoplasm (Bethesda IV). FNA cannot distinguish benign from malignant follicular tumors. Diagnostic lobectomy is required for definitive histology."
    }, {
      "cat": "V",
      "action": "SURGERY",
      "why": "Suspicious for Malignancy (Bethesda V). High probability of cancer (≈60–75%). Proceed to the Cancer Management module to plan surgery."
    }, {
      "cat": "VI",
      "action": "SURGERY",
      "why": "Malignant (Bethesda VI). Confirmed malignancy (≈97–99% risk). Proceed to the Cancer Management module for definitive surgical planning."
    }],
    "RCPath_Thy": [{
      "cat": "Thy1/1c",
      "action": "REPEAT_US_GUIDED_FNA",
      "why": "Nondiagnostic (Thy1/1c). The sample is inadequate for diagnosis. Repeat US-guided FNA is recommended."
    }, {
      "cat": "Thy2/2c",
      "action": "US_SURVEILLANCE",
      "interval_months": "12-24",
      "why": "Benign (Thy2/2c). Follow-up with ultrasound is recommended. Consider repeat FNA if US features are high-risk (U4/U5) due to discordance."
    }, {
      "cat": "Thy3a",
      "action": "REPEAT_FNA_OR_CNB_±_MOLECULAR",
      "why": "Atypia / Indeterminate (Thy3a). Options include repeat FNA or diagnostic surgery, guided by sonographic (U-class) and clinical risk."
    }, {
      "cat": "Thy3f",
      "action": "DIAGNOSTIC_LOBECTOMY",
      "why": "Follicular Neoplasm Likely (Thy3f). Histological confirmation is required via diagnostic lobectomy."
    }, {
      "cat": "Thy4",
      "action": "SURGERY",
      "why": "Suspicious for Malignancy (Thy4). High suspicion of cancer. Proceed to the Cancer Management module to plan surgery after MDT discussion."
    }, {
      "cat": "Thy5",
      "action": "SURGERY",
      "why": "Malignant (Thy5). Confirmed malignancy. Proceed to the Cancer Management module for definitive surgical planning."
    }]
  },
  "discordance_rules": [{
    "when_all": [{
      "or": [{
        "in": ["assigned_pattern", ["ATA_high", "ATA_intermediate"]]
      }, {
        "in": ["assigned_u", ["U4", "U5"]]
      }]
    }, {
      "or": [{
        "eq": ["bethesda_cat", "II"]
      }, {
        "eq": ["rcpath_thy", "Thy2/2c"]
      }]
    }],
    "action": "REPEAT_FNA_OR_CNB_±_MOLECULAR",
    "why": "Discordance: High-risk US features with benign cytology warrants repeat sampling to reduce false negatives."
  }]
};