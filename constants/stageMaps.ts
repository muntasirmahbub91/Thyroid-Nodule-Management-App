// Dr Muntasir's Thyroid Cancer Management App — Module Logic
// Staging and Risk Stratification Map based on AJCC 8th Ed. and ATA/NCCN Guidelines.

export const THYROID_CANCER_STAGE_MAP = {
  differentiated: {
    T: {
      T1a: "≤1 cm, confined to thyroid",
      T1b: ">1 cm ≤ 2 cm, confined to thyroid",
      T2: ">2 cm ≤ 4 cm, confined to thyroid",
      T3a: ">4 cm, limited to thyroid",
      T3b: "Minimal extrathyroidal extension (strap/perithyroid tissue)",
      T4a: "Gross extension into strap, trachea, larynx, esophagus, or subcutaneous tissue",
      T4b: "Invades prevertebral fascia or encases carotid/mediastinal vessels"
    },
    N: {
      N0: "No nodal metastasis",
      N1a: "Central compartment (Level VI, upper mediastinal)",
      N1b: "Lateral cervical or retropharyngeal nodes"
    },
    M: { M0: "No distant metastasis", M1: "Distant metastasis" },

    stageGroups: [
      // Age <55
      { age: "<55", M0: "Stage I", M1: "Stage II" },
      // Age ≥55
      {
        age: "≥55",
        stages: [
          { T: ["T1a", "T1b"], N: ["N0"], M: "M0", stage: "Stage I" },
          { T: ["T2", "T3a", "T3b"], N: ["N0"], M: "M0", stage: "Stage II" },
          { T: ["T1a", "T1b", "T2", "T3a", "T3b"], N: ["N1a", "N1b"], M: "M0", stage: "Stage II" },
          { T: ["T4a"], anyN: true, M: "M0", stage: "Stage III" },
          { T: ["T4b"], anyN: true, M: "M0", stage: "Stage IVA" },
          { anyT: true, anyN: true, M: "M1", stage: "Stage IVB" }
        ]
      }
    ],
    riskStratification: [
      {
        category: "Low Risk",
        criteria: [
          "All disease confined to thyroid, completely resected",
          "No local or distant metastasis",
          "No vascular invasion",
          "Microscopic capsular invasion only (follicular carcinoma)",
          "≤5 small lymph-node micrometastases (<0.2 cm)",
          "No aggressive histologic variant"
        ],
        recurrenceRisk: "<5 %",
        recommendation: "Observation ± TSH suppression; no RAI"
      },
      {
        category: "Intermediate Risk",
        criteria: [
          "Microscopic extrathyroidal extension",
          "Vascular invasion (≥4 foci)",
          "Aggressive histology (tall-cell, columnar, Hurthle)",
          "Lymph-node metastases 0.2–3 cm",
          "Close surgical margins"
        ],
        recurrenceRisk: "5–20 %",
        recommendation: "Consider selective RAI; TSH 0.1–0.5 mIU/L"
      },
      {
        category: "High Risk",
        criteria: [
          "Gross extrathyroidal extension",
          "Incomplete resection",
          "Distant metastases",
          "Large-volume nodal disease (>3 cm or extranodal extension)",
          "Extensive vascular invasion"
        ],
        recurrenceRisk: ">20 %",
        recommendation: "RAI 100–200 mCi ± EBRT; TSH <0.1 mIU/L"
      }
    ]
  },
  medullary: {
    T: {
      T1a: "≤1 cm, confined to thyroid",
      T1b: ">1 cm ≤ 2 cm, confined to thyroid",
      T2: ">2 cm ≤ 4 cm",
      T3: ">4 cm or minimal extrathyroidal extension",
      T4a: "Gross invasion into strap muscles, trachea, etc.",
      T4b: "Invades prevertebral fascia / great vessels"
    },
    N: { N0: "No nodes", N1a: "Central", N1b: "Lateral/mediastinal" },
    M: { M0: "No metastasis", M1: "Distant metastasis" },
    stageGroups: [
      { T: ["T1a", "T1b"], N: ["N0"], M: "M0", stage: "Stage I" },
      { T: ["T2", "T3"], N: ["N0"], M: "M0", stage: "Stage II" },
      { T: ["T1a", "T1b", "T2", "T3"], N: ["N1a"], M: "M0", stage: "Stage III" },
      { T: ["T1a", "T1b", "T2", "T3"], N: ["N1b"], M: "M0", stage: "Stage IVA" },
      { T: ["T4a"], anyN: true, M: "M0", stage: "Stage IVA" },
      { T: ["T4b"], anyN: true, M: "M0", stage: "Stage IVB" },
      { anyT: true, anyN: true, M: "M1", stage: "Stage IVC" }
    ]
  },
  anaplastic: {
    T: {
      T1a: "≤1 cm, confined to thyroid",
      T1b: ">1 cm ≤ 2 cm, confined to thyroid",
      T2: ">2 cm ≤ 4 cm, confined to thyroid",
      T3a: ">4 cm, limited to thyroid",
      T3b: "Minimal extrathyroidal extension (strap/perithyroid tissue)",
      T4a: "Gross extension into strap, trachea, larynx, esophagus, or subcutaneous tissue",
      T4b: "Invades prevertebral fascia or encases carotid/mediastinal vessels"
    },
    N: { N0: "No nodal disease", N1: "Regional nodes present" },
    M: { M0: "No metastasis", M1: "Distant metastasis" },
    stageGroups: [
      { T: ["T1a", "T1b", "T2", "T3a"], N: ["N0"], M: "M0", stage: "Stage IVA" },
      { T: ["T1a", "T1b", "T2", "T3a"], N: ["N1"], M: "M0", stage: "Stage IVB" },
      { T: ["T3b", "T4a", "T4b"], anyN: true, M: "M0", stage: "Stage IVB" },
      { anyT: true, anyN: true, M: "M1", stage: "Stage IVC" }
    ]
  }
};
