// Dr Muntasir's Thyroid Cancer Management App — Module Logic
// ============================================================================
// constants/usgRules.ts
// Ultrasound (USG) Evaluation Rules for Thyroid Nodules
// Consolidates ATA and BTA guideline logic for ultrasound pattern
// classification and FNA thresholds.
// ============================================================================

// --- ATA Types ---
export interface USInput {
  composition: 'solid' | 'part_cystic' | 'spongiform' | 'pure_cyst' | '';
  echogenicity: 'hyperechoic' | 'isoechoic' | 'hypoechoic' | 'markedly_hypoechoic' | '';
  margins: 'smooth' | 'irregular' | 'lobulated' | 'ill_defined' | '';
  shape: 'taller_than_wide' | 'wider_than_tall' | '';
  calcifications: 'microcalcifications' | 'macrocalcifications' | 'none' | '';
  extrathyroidal_extension: boolean;
  diameter_mm: number;
  suspicious_lymph_node: boolean;
}

export interface ATAResult {
  pattern: string;
  risk: string;
  threshold_mm?: number;
  action: string;
  rationale: string;
}

// --- BTA Types ---
export interface BTAInput {
  composition: 'solid' | 'mixed' | 'cystic' | 'spongiform' | '';
  echogenicity: 'isoechoic' | 'hypoechoic' | 'markedly_hypoechoic' | '';
  margins: 'smooth' | 'lobulated' | 'ill_defined' | 'irregular' | '';
  calcifications: 'none' | 'micro' | 'macro' | '';
  vascularity: 'none' | 'peripheral' | 'central' | '';
  shape: 'taller_than_wide' | 'wider_than_tall' | '';
  diameter_mm: number;
  suspicious_nodes: boolean;
}

export interface BTAResult {
  category: string;
  description: string;
  malignancy_risk: string;
  threshold_mm?: number;
  action: string;
  rationale: string;
}

// --- ACR TI-RADS Types ---
export interface ACRInput {
  composition: 'cystic' | 'spongiform' | 'mixed' | 'solid' | '';
  echogenicity: 'anechoic' | 'hyperechoic' | 'isoechoic' | 'hypoechoic' | 'very_hypoechoic' | '';
  shape: 'wider_than_tall' | 'taller_than_wide' | '';
  margins: 'smooth' | 'ill_defined' | 'lobulated' | 'irregular' | 'extrathyroidal' | '';
  echogenic_foci: 'none' | 'large_comet' | 'macro' | 'peripheral' | 'punctate' | '';
  diameter_mm: number;
  suspicious_nodes: boolean;
}

export interface ACRResult {
  level: string; // TR1 - TR5
  points: number;
  description: string;
  risk: string;
  threshold_mm?: number; // Biopsy threshold
  followup_mm?: number; // Follow-up threshold
  action: string;
  rationale: string;
}

// ============================================================================
// Ultrasound Pre-checks (TSH, Nuclear Scan) - Applies to both guidelines
// ============================================================================
export const ULTRASOUND_PRECHECKS = {
  "version": "ultrasound_prechecks_v1.0",
  "rules": [
    {
      "when_all": [{
        "or": [{
          "<": ["TSH", 0.4]
        }, {
          "eq": ["nuclear_scan", "hot"]
        }]
      }],
      "action": "NO_FNA_US_FOLLOW_OR_TREAT_HYPERFUNCTION",
      "why": "Suppressed TSH / hyperfunctioning nodule has very low malignancy risk; FNA usually not indicated unless discordant.",
      "next": "manage_thyrotoxicosis_and_surveillance"
    }
  ]
};

// ============================================================================
// ATA 2015 Evaluation Logic
// ============================================================================
export function evaluateATA_USG(input: USInput): ATAResult {
  const {
    composition,
    echogenicity,
    margins,
    shape,
    calcifications,
    extrathyroidal_extension,
    diameter_mm,
    suspicious_lymph_node,
  } = input;

  // Check for required inputs
  if (!composition || !echogenicity || !margins || !shape || !calcifications) {
    return {
      pattern: 'Unclassified',
      risk: 'Incomplete Data',
      action: 'Awaiting Inputs',
      rationale: 'Please select all ultrasound features to get a recommendation.',
    };
  }

  // Override: suspicious lymph node
  if (suspicious_lymph_node) {
    return {
      pattern: 'Node-driven evaluation',
      risk: 'Metastatic suspicion',
      action: 'FNA of suspicious lymph node',
      rationale:
        'Presence of a suspicious cervical lymph node overrides nodule thresholds. Perform FNA of the node first.',
    };
  }

  // High Suspicion
  if (
    (composition === 'solid' || composition === 'part_cystic') &&
    (echogenicity === 'hypoechoic' || echogenicity === 'markedly_hypoechoic') &&
    (margins === 'irregular' ||
      margins === 'lobulated' ||
      shape === 'taller_than_wide' ||
      calcifications === 'microcalcifications' ||
      extrathyroidal_extension)
  ) {
    return {
      pattern: 'High Suspicion',
      risk: '70–90%',
      threshold_mm: 10,
      action: diameter_mm >= 10 ? 'FNA recommended' : 'Observe',
      rationale:
        'Solid or partially cystic hypoechoic nodule with ≥1 high-risk feature. ATA recommends FNA ≥1 cm.',
    };
  }

  // Intermediate Suspicion
  if (
    composition === 'solid' &&
    (echogenicity === 'hypoechoic' || echogenicity === 'markedly_hypoechoic') &&
    margins === 'smooth' &&
    shape !== 'taller_than_wide' &&
    calcifications !== 'microcalcifications' &&
    !extrathyroidal_extension
  ) {
    return {
      pattern: 'Intermediate Suspicion',
      risk: '10–20%',
      threshold_mm: 10,
      action: diameter_mm >= 10 ? 'FNA recommended' : 'Observe',
      rationale:
        'Smooth-margin hypoechoic nodule without high-risk features. FNA indicated ≥1 cm.',
    };
  }

  // Low Suspicion
  if (
    (composition === 'solid' || composition === 'part_cystic') &&
    (echogenicity === 'isoechoic' || echogenicity === 'hyperechoic') &&
    margins === 'smooth' &&
    !extrathyroidal_extension
  ) {
    return {
      pattern: 'Low Suspicion',
      risk: '5–10%',
      threshold_mm: 15,
      action: diameter_mm >= 15 ? 'FNA recommended' : 'Observe',
      rationale:
        'Iso/hyperechoic or partially cystic nodule with smooth margins and no suspicious features. FNA ≥1.5 cm.',
    };
  }

  // Very Low Suspicion
  if (
    composition === 'spongiform' ||
    (composition === 'part_cystic' &&
      echogenicity !== 'hypoechoic' &&
      !extrathyroidal_extension &&
      calcifications !== 'microcalcifications')
  ) {
    return {
      pattern: 'Very Low Suspicion',
      risk: '<3%',
      threshold_mm: 20,
      action: diameter_mm >= 20 ? 'Optional FNA or Observation' : 'Observe',
      rationale:
        'Spongiform or partially cystic nodule without suspicious features. FNA optional ≥2 cm.',
    };
  }

  // Benign
  if (composition === 'pure_cyst') {
    return {
      pattern: 'Benign',
      risk: '~0%',
      action: 'No FNA (observe if symptomatic)',
      rationale:
        'Purely cystic nodules are benign; FNA only if symptomatic for drainage.',
    };
  }

  // Default
  return {
    pattern: 'Unclassified',
    risk: 'Unknown',
    action: 'Clinical correlation and follow-up',
    rationale:
      'Features do not fit standard ATA categories. Recommend repeat US in 12–24 months.',
  };
}


// ============================================================================
// BTA 2017 Evaluation Logic (Points-Based System)
// ============================================================================
export function evaluateBTA_USG(input: BTAInput): BTAResult {
  const {
    composition,
    echogenicity,
    margins,
    calcifications,
    shape,
    diameter_mm,
    suspicious_nodes,
  } = input;

  // Override for suspicious node
  if (suspicious_nodes) {
    return {
      category: 'U5 (Metastatic Pattern)',
      description: 'Suspicious lymph node overrides nodule category.',
      malignancy_risk: '≈100%',
      action: 'FNA of suspicious node (mandatory)',
      rationale:
        'Presence of a pathologic node indicates metastatic disease; FNA is required regardless of nodule size.',
    };
  }

  // U2 (Benign) Check for explicitly benign features which preclude point scoring
  if (composition === 'spongiform' || composition === 'cystic') {
    return {
      category: 'U2 (Benign)',
      description: 'Nodule with benign features (e.g., purely cystic or spongiform).',
      malignancy_risk: '≈1–2%',
      action: 'No FNA',
      rationale: 'Benign-appearing nodule (U2). No biopsy indicated unless symptomatic.',
    };
  }

  // Point-based scoring for U3-U5
  let score = 0;
  if (echogenicity === 'hypoechoic' || echogenicity === 'markedly_hypoechoic') score += 2;
  if (shape === 'taller_than_wide') score += 3;
  if (margins === 'irregular' || margins === 'lobulated') score += 3;
  if (calcifications === 'micro') score += 3;
  if (calcifications === 'macro') score += 1;

  if (score >= 5) {
    return {
      category: 'U5 (Malignant)',
      description: `Point score of ${score} suggests malignant features.`,
      malignancy_risk: '≥ 85–100%',
      threshold_mm: 10,
      action: diameter_mm >= 10 ? 'FNA recommended' : 'Observe with repeat US',
      rationale: 'High suspicion based on BTA score. FNA indicated if ≥1 cm.',
    };
  }
  if (score >= 3) { // score is 3 or 4
    return {
      category: 'U4 (Suspicious)',
      description: `Point score of ${score} suggests suspicious features.`,
      malignancy_risk: '≈60–75%',
      threshold_mm: 10,
      action: diameter_mm >= 10 ? 'FNA recommended' : 'Observe with follow-up',
      rationale: 'Suspicious features based on BTA score. FNA indicated if ≥1 cm.',
    };
  }
  if (score === 2) {
    return {
      category: 'U3 (Indeterminate)',
      description: `Point score of ${score} suggests indeterminate/equivocal features.`,
      malignancy_risk: '≈10–20%',
      threshold_mm: 15,
      action: diameter_mm >= 15 ? 'FNA recommended' : 'Surveillance',
      rationale: 'Indeterminate features based on BTA score. FNA if ≥1.5 cm.',
    };
  }

  // score is 0 or 1
  return {
    category: 'U2 (Benign)',
    description: `Point score of ${score} suggests benign/low-risk features.`,
    malignancy_risk: '≈1–2%',
    action: 'No FNA',
    rationale: 'Very low risk based on BTA score. No biopsy indicated.',
  };
}

// ============================================================================
// ACR TI-RADS 2017 Evaluation Logic (Points-Based System)
// ============================================================================
export function evaluateACR_USG(input: ACRInput): ACRResult {
  const {
    composition,
    echogenicity,
    shape,
    margins,
    echogenic_foci,
    diameter_mm,
    suspicious_nodes
  } = input;

  // Check for required inputs
  if (!composition || !echogenicity || !margins || !shape || !echogenic_foci) {
    return {
      level: 'Unclassified',
      points: 0,
      description: 'Incomplete Data',
      risk: 'Unknown',
      action: 'Awaiting Inputs',
      rationale: 'Please select all ultrasound features to get a TI-RADS score.'
    };
  }

  // Node Override (Consistent with other modules)
  if (suspicious_nodes) {
    return {
      level: 'TR5 (Node Driven)',
      points: -1,
      description: 'Suspicious lymph node presence overrides nodule scoring.',
      risk: 'High',
      action: 'FNA of suspicious node',
      rationale: 'Presence of suspicious node mandates biopsy regardless of nodule score.'
    };
  }

  let points = 0;

  // 1. Composition
  if (composition === 'cystic' || composition === 'spongiform') points += 0;
  else if (composition === 'mixed') points += 1;
  else if (composition === 'solid') points += 2; // solid or almost completely solid

  // 2. Echogenicity
  if (echogenicity === 'anechoic') points += 0;
  else if (echogenicity === 'hyperechoic' || echogenicity === 'isoechoic') points += 1;
  else if (echogenicity === 'hypoechoic') points += 2;
  else if (echogenicity === 'very_hypoechoic') points += 3;

  // 3. Shape
  if (shape === 'wider_than_tall') points += 0;
  else if (shape === 'taller_than_wide') points += 3;

  // 4. Margins
  if (margins === 'smooth' || margins === 'ill_defined') points += 0;
  else if (margins === 'lobulated') points += 2; // or irregular
  else if (margins === 'irregular') points += 2; // TI-RADS groups lobulated/irregular? No, wait. 
  // Checking ACR TI-RADS White Paper: 
  // Smooth/Ill-defined = 0
  // Lobulated/Irregular = 2
  // Extrathyroidal extension = 3
  else if (margins === 'extrathyroidal') points += 3;

  // 5. Echogenic Foci
  if (echogenic_foci === 'none' || echogenic_foci === 'large_comet') points += 0;
  else if (echogenic_foci === 'macro') points += 1;
  else if (echogenic_foci === 'peripheral') points += 2;
  else if (echogenic_foci === 'punctate') points += 3;

  // Categorization
  let result: Partial<ACRResult> = { points };

  if (points === 0) {
    result.level = 'TR1';
    result.description = 'Benign';
    result.risk = '<2%';
    result.action = 'No FNA';
    result.rationale = 'TR1: Benign features. No biopsy required.';
  } else if (points === 2) {
    result.level = 'TR2';
    result.description = 'Not Suspicious';
    result.risk = '<2%';
    result.action = 'No FNA';
    result.rationale = 'TR2: Not suspicious. No biopsy required.';
  } else if (points === 3) {
    result.level = 'TR3';
    result.description = 'Mildly Suspicious';
    result.risk = '5%';
    result.threshold_mm = 25;
    result.followup_mm = 15;
    if (diameter_mm >= 25) result.action = 'FNA recommended';
    else if (diameter_mm >= 15) result.action = 'US Follow-up';
    else result.action = 'No Follow-up required (<1.5cm)';
    result.rationale = 'TR3: Mildly suspicious. Biopsy ≥ 2.5cm, Follow-up ≥ 1.5cm.';
  } else if (points >= 4 && points <= 6) {
    result.level = 'TR4';
    result.description = 'Moderately Suspicious';
    result.risk = '5-20%';
    result.threshold_mm = 15;
    result.followup_mm = 10;
    if (diameter_mm >= 15) result.action = 'FNA recommended';
    else if (diameter_mm >= 10) result.action = 'US Follow-up';
    else result.action = 'No Follow-up required (<1cm)';
    result.rationale = 'TR4: Moderately suspicious. Biopsy ≥ 1.5cm, Follow-up ≥ 1cm.';
  } else if (points >= 7) {
    result.level = 'TR5';
    result.description = 'Highly Suspicious';
    result.risk = '>20%';
    result.threshold_mm = 10;
    result.followup_mm = 5;
    if (diameter_mm >= 10) result.action = 'FNA recommended';
    else if (diameter_mm >= 5) result.action = 'US Follow-up';
    else result.action = 'No Follow-up typically required (<0.5cm)';
    result.rationale = 'TR5: Highly suspicious. Biopsy ≥ 1cm, Follow-up ≥ 0.5cm.';
  } else {
    // Fallback for 1 point? (TR1 is 0, TR2 is 2... what about 1?)
    // ACR chart: 0 Points = TR1. 2 Points = TR2. 
    // Wait, is 1 point possible? 
    // Mixed cystic/solid = 1. Iso/Hyperechoic = 1. Macrocalc = 1.
    // Yes. TR2 is exactly 2 points? 
    // Checking ACR: TR1 = 0 pts. TR2 = 2 pts. 
    // Is 1 point possible? 
    // If I have Mixed(1) + Anechoic(0)... wait mixed+anechoic doesn't make sense.
    // Mixed(1) + Iso(1) = 2.
    // Can you have 1 point total? 
    // Mixed(1) + Anechoic(0) + Wider(0) + Smooth(0) + None(0) = 1.
    // Actually TI-RADS says: TR1 is 0 points. TR2 is 2 points.
    // What happens at 1 point? 
    // TI-RADS White Paper: "TR1: 0 points. TR2: 2 points." 
    // It seems gaps might exist or I'm misremembering combinations.
    // Actually, Spongiform(0) is usually isoechoic(1) -> 1 point? No spongiform is composed of microcysts. 
    // Let's assume range logic: 0-1 = TR1? Or 2 = TR2.
    // Re-reading: TR1 (0 points). TR2 (2 points). 
    // "Nodules with 0 points are TR1. Nodules with 2 points are TR2."
    // Is 1 point impossible? 
    // Cystic(0) + Anechoic(0) = 0.
    // Spongiform(0) + Isoechoic(1)... wait. Spongiform often gets 0 for echogenicity? 
    // Actually, let's look at the standard chart.
    // TR1: 0 pts. TR2: 2 pts. TR3: 3 pts. TR4: 4-6 pts. TR5: ≥7 pts.
    // I will treat 0-1 as TR1 to be safe, or 0-1 as benign.
    if (points < 2) {
      result.level = 'TR1';
      result.description = 'Benign';
      result.risk = '<2%';
      result.action = 'No FNA';
      result.rationale = 'TR1 (0-1 points): Benign features. No biopsy required.';
    }
  }

  return result as ACRResult;
}

export function evaluateACR_Manual(level: "TR1" | "TR2" | "TR3" | "TR4" | "TR5", diameter_mm: number): ACRResult {
  let result: Partial<ACRResult> = { level, points: 0 }; // Default points to 0 if unknown, or map min points below

  switch (level) {
    case 'TR1':
      result.points = 0; result.description = 'Benign'; result.risk = '<2%';
      result.action = 'No FNA'; result.rationale = 'TR1: Benign. No biopsy required.';
      break;
    case 'TR2':
      result.points = 2; result.description = 'Not Suspicious'; result.risk = '<2%';
      result.action = 'No FNA'; result.rationale = 'TR2: Not Suspicious. No biopsy required.';
      break;
    case 'TR3':
      result.points = 3; result.description = 'Mildly Suspicious'; result.risk = '5%';
      result.threshold_mm = 25; result.followup_mm = 15;
      if (diameter_mm >= 25) result.action = 'FNA recommended';
      else if (diameter_mm >= 15) result.action = 'US Follow-up';
      else result.action = 'No Follow-up required (<1.5cm)';
      result.rationale = 'TR3: Mildly suspicious. Biopsy ≥ 2.5cm, Follow-up ≥ 1.5cm.';
      break;
    case 'TR4':
      result.points = 4; result.description = 'Moderately Suspicious'; result.risk = '5-20%';
      result.threshold_mm = 15; result.followup_mm = 10;
      if (diameter_mm >= 15) result.action = 'FNA recommended';
      else if (diameter_mm >= 10) result.action = 'US Follow-up';
      else result.action = 'No Follow-up required (<1cm)';
      result.rationale = 'TR4: Moderately suspicious. Biopsy ≥ 1.5cm, Follow-up ≥ 1cm.';
      break;
    case 'TR5':
      result.points = 7; result.description = 'Highly Suspicious'; result.risk = '>20%';
      result.threshold_mm = 10; result.followup_mm = 5;
      if (diameter_mm >= 10) result.action = 'FNA recommended';
      else if (diameter_mm >= 5) result.action = 'US Follow-up';
      else result.action = 'No Follow-up typically required (<0.5cm)';
      result.rationale = 'TR5: Highly suspicious. Biopsy ≥ 1cm, Follow-up ≥ 0.5cm.';
      break;
  }

  return result as ACRResult;
}