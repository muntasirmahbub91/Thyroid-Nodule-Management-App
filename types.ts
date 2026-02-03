export type DataSource = "clinical" | "endoscopy" | "US" | "FNAC" | "CT" | "MRI" | "PETCT" | "CBCT" | "pathology" | "virology" | "lab";
export type Provenanced<T> = { value: T; source?: DataSource; date?: string; note?: string };

export interface Biomarkers {
  tg_ng_ml?: number;
  tg_ab?: boolean;
  calcitonin_pg_ml?: number;
  cea_ng_ml?: number;
  ret_germline_result?: "pathogenic" | "VUS" | "negative";
  braf_v600e?: boolean;
  ret_fusion?: boolean;
  ntrk_fusion?: boolean;
  alk_fusion?: boolean;
  msi_dmmr?: boolean;
  tmb_high?: boolean;
}

export interface CaseInput {
  family: "Thyroid";
  histology?: ThyroidHistology;
  context: "clinical" | "pathologic";
  resectable?: boolean;
  biomarkers?: Biomarkers;

  primary?: {
    size_cm?: Provenanced<number>;
    grossEtePlanes?: string[];
  };

  nodes?: {
    levels?: {
      level_vi_vii?: boolean;
      lateral_neck_or_retropharyngeal?: boolean;
    },
    invasion_of_critical_structures?: boolean;
  };

  metastasis?: {
    confirmed?: boolean;
    suspected?: boolean;
    sites?: string[];
    evidence?: "biopsy" | "petct" | "ct_mri" | "clinical";
  };

  patient?: {
    age_years?: number;
    cisplatin_contraindicated?: boolean;
    rai_contraindicated?: boolean;
    pheochromocytoma_ruled_out?: boolean;
  };

  staging?: {
    T: string;
    N: string;
    M: string;
    stage: string;
  };

  // Adjuvant specific fields
  stage_group?: "I" | "II" | "III" | "IVA" | "IVB" | "IVC";

  // DTC Adjuvant
  index_surgery?: "lobectomy" | "total_thyroidectomy";
  largest_focus_cm?: number;
  neck_dissection_performed?: boolean;
  gross_ETE?: boolean;
  N_pattern?: "N0" | "N1a_tiny" | "N1a_micro" | "N1a" | "N1b";
  nodes_positive_count?: number;
  lymphatic_invasion?: boolean;
  vascular_invasion?: boolean;
  multifocal_macroscopic?: boolean;
  hist_variant_high_risk?: boolean;         // tall/columnar/hobnail/diffuse sclerosing/solid-trabecular
  differentiated_high_grade?: boolean;
  margin_status?: "negative" | "close" | "positive";
  tg_unstim_ng_ml?: number;                 // unstimulated thyroglobulin
  tg_ab?: boolean;
  neck_ultrasound_negative?: boolean;

  // MTC Adjuvant
  margin_status_mtc?: "negative" | "positive";
  gross_residual?: boolean;
  threat_vital_structures?: boolean;

  // ATC Adjuvant
  BRAF_V600E_used_neoadjuvant?: boolean;
  targeted_io_preop?: boolean;

  // Handoff Context Display
  prior_surgery_summary?: {
    surgery: string;
    details: string[];
  };
}

export type ThyroidHistology = "DTC_papillary" | "DTC_follicular" | "DTC_oncocytic" | "MTC" | "ATC";


export interface StagingOutput {
  T: string;
  T_why: string;
  N: string;
  N_why: string;
  M: string;
  M_why: string;
  stage: string;
  stage_why: string;
}

export interface TreatmentRecommendation {
  plan_id: string;
  label: string; // e.g., "Thyroid Lobectomy"
  rationale: string; // The clinical explanation for the recommendation
  indications: string[]; // The specific criteria from the case that were met
  notes?: string[];
}

export interface TreatmentOutput {
  thyroidSurgery?: TreatmentRecommendation;
  neckSurgery?: TreatmentRecommendation;
}

export interface AdjuvantOutput {
  plan: string;
  explain: string;
  notes?: string[];
}

export interface Results {
  staging: StagingOutput;
  treatment: TreatmentOutput;
  adjuvant?: AdjuvantOutput;
}

// --- Thyroid Nodule Types ---

export type Guideline = "ATA" | "BTA" | "ACR";
export type CytologySystem = "Bethesda" | "RCPath_Thy";

export interface USFeatures {
  composition: "solid" | "part_cystic" | "pure_cyst" | "spongiform" | "";
  echogenicity: "markedly_hypoechoic" | "hypoechoic" | "isoechoic" | "hyperechoic" | "";
  margins: 'smooth' | 'irregular' | 'lobulated' | 'ill_defined' | '';
  shape: 'taller_than_wide' | 'wider_than_tall' | '';
  calcifications: 'microcalcifications' | 'macrocalcifications' | 'none' | '';
  vascularity: 'none' | 'peripheral' | 'central' | '';
  extrathyroidal_extension: boolean;
  max_diameter_mm: number | null;
}

export interface PostOpHistology {
  final_histology: "PTC" | "FTC" | "Oncocytic" | "NIFTP" | "Poorly-differentiated" | "";
  margin_status: "negative" | "close" | "positive" | "";
  gross_ETE: boolean;
  vascular_invasion_vessels: "none" | "1-3" | ">=4" | "";
  widely_invasive: boolean;
  nodes_path_positive: boolean;
}

export interface NoduleCaseInput {
  // Patient Demographics
  patient_age: number | null;
  patient_sex: "male" | "female" | "";

  TSH: number | null;
  // Detailed Scan Pattern for Radionuclide Scan Override
  scan_pattern: "not_performed" | "hot_nodule" | "diffuse_graves" | "patchy_mng" | "cold_nodule" | "indeterminate_warm";
  scan_concordant?: boolean; // Does hot spot match the suspicious US nodule?
  continue_despite_low_tsh: boolean;
  guideline: Guideline;
  manual_ti_rads_level?: "TR1" | "TR2" | "TR3" | "TR4" | "TR5";
  features: USFeatures;
  node_suspicious: boolean;
  calcitonin_elevated: boolean;

  // Derived by service
  assigned_pattern?: "ATA_high" | "ATA_intermediate" | "ATA_low" | "ATA_very_low" | "ATA_benign" | "TR5" | "TR4" | "TR3" | "TR2" | "TR1";
  assigned_u?: "U1" | "U2" | "U3" | "U4" | "U5";

  // Post-FNA inputs
  cytology_system: CytologySystem;
  bethesda_cat: "I" | "II" | "III" | "IV" | "V" | "VI" | "";
  rcpath_thy: "Thy1/1c" | "Thy2/2c" | "Thy3a" | "Thy3f" | "Thy4" | "Thy5" | "";

  // Node FNA (if suspicious node was biopsied)
  node_fna_performed?: boolean;
  node_fna_result?: "positive_tg" | "positive_calcitonin" | "negative" | "non_diagnostic" | "";

  // Post-Op Histology
  post_op_histology?: PostOpHistology;
}

export type NoduleAction =
  | "NO_FNA_US_FOLLOW_OR_TREAT_HYPERFUNCTION"
  | "TREAT_HYPERTHYROIDISM"
  | "FNA_PRIMARY"
  | "FNA_NODE_WITH_WASHOUT"
  | "CONSIDER_FNA_OR_OBSERVE"
  | "US_SURVEILLANCE"
  | "REPEAT_US_GUIDED_FNA"
  | "REPEAT_FNA_OR_CNB_±_MOLECULAR"
  | "MOLECULAR_TESTING"
  | "DIAGNOSTIC_LOBECTOMY"
  | "SURGERY"
  | "NO_FNA_THERAPEUTIC_ASPIRATION_IF_SYMPTOMATIC"
  | "FNA_PRIMARY_ANY_SIZE"
  | "NO_FNA_ROUTINE"
  | "RECOMMEND_COMPLETION_TT"
  | "SURVEILLANCE_ONLY"
  | "AWAITING_INPUTS";


export interface ActionOut {
  step: "precheck" | "us_fna" | "post_fna" | "post_op";
  action: NoduleAction;
  why: string;
  interval_months?: number | string;
  washout?: "Tg_washout" | "Calcitonin_washout";
  proceed_to_management: boolean;
  assigned_pattern?: string;
}

export interface NoduleHandoffContext {
  histology: ThyroidHistology;
  size_cm: number;
  node_positive: boolean;
  calcitonin_elevated: boolean;
  index_surgery?: "lobectomy" | "total_thyroidectomy";
  post_op_histology?: PostOpHistology;
}

// --- FSM Architecture Types ---

export interface ThyroidCaseContext {
  // Module 1: Entry
  tsh: {
    value?: number;
    status: "LOW_OR_SUPPRESSED" | "NORMAL" | "HIGH" | "UNKNOWN";
  };
  clinical: {
    is_pregnant: boolean;
    is_lactating: boolean;
    red_flags: string[]; // ["rapid_growth", "hoarseness", etc]
    symptoms: string[]; // ["tremor", "palpitations"]
    history_of_radiation?: boolean;
    family_history_cancer?: boolean;
  };

  // Module 2: Ultrasound
  ultrasound: {
    system: "ATA_2015" | "ACR_TI_RADS_2017";
    suspicious_nodes: boolean;
    nodules: Array<{
      id: string;
      size_cm: number;
      pattern: string; // "TR5" or "HIGH"
      location: string;
      features?: USFeatures;
    }>;
    index_nodule_id: string | null; // The one selected for potential biopsy
  };

  // Module 3: Scan (Conditional)
  scan?: {
    performed: boolean;
    pattern: "HOT" | "COLD" | "WARM" | "DIFFUSE" | "PATCHY" | "LOW" | "UNCLASSIFIED";
    concordance: "MATCH" | "MISMATCH" | "UNCERTAIN";
  };

  // Module 4: Hyperthyroid Treatment (Conditional)
  hyperthyroidism?: {
    etiology?: "TOXIC_ADENOMA" | "TMNG" | "GRAVES" | "THYROIDITIS" | "UNKNOWN";
    compressive_symptoms?: boolean;
    patient_preference?: "RAI" | "SURGERY" | "MEDS";
  };

  // Module 5: Pathology
  pathology?: {
    bethesda_category: "I" | "II" | "III" | "IV" | "V" | "VI";
    rcpath_category?: "Thy1" | "Thy1c" | "Thy2" | "Thy2c" | "Thy3a" | "Thy3f" | "Thy4" | "Thy5";
    molecular_available: boolean;
    prior_nondiagnostic_count: number;
    molecular_results?: string;
  };

  // Module 6: Surgery & Adjuvant
  cancer_extent?: {
    malignancy_confirmed: boolean;
    nodal_status: "cN0" | "cN1a" | "cN1b";
    tumor_size_cm: number;
    multifocality: boolean;
    gross_ete: boolean;
    distant_metastasis: boolean;
    bilateral_disease: boolean;
  };

  surgery_performed?: {
    procedure: "LOBECTOMY" | "TOTAL_THYROIDECTOMY" | "NONE";
    neck_dissection: "NONE" | "CENTRAL" | "LATERAL" | "BOTH";
    pathology_report?: PostOpHistology;
  };

  // Outputs (Accumulated recommendations)
  recommendations: {
    immediate_action: string[]; // e.g. ["Order US", "Start Beta Blockers"]
    terminal_plan: string | null; // e.g. "TOTAL_THYROIDECTOMY"
    reasoning_log: string[];
  };
}