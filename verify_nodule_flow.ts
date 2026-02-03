
import { evaluateThyroidNoduleFlow } from './services/noduleFlowAlgorithm';
import { NoduleCaseInput } from './types';

const baseInput: NoduleCaseInput = {
    TSH: 2.0,
    scan_pattern: 'not_performed',
    scan_concordant: undefined,
    continue_despite_low_tsh: false,
    guideline: 'ATA',
    features: {
        composition: 'solid',
        echogenicity: 'hypoechoic',
        margins: 'smooth',
        shape: 'wider_than_tall',
        calcifications: 'none',
        vascularity: 'none',
        extrathyroidal_extension: false,
        max_diameter_mm: 15
    },
    node_suspicious: false,
    calcitonin_elevated: false,
    cytology_system: 'Bethesda',
    bethesda_cat: '',
    rcpath_thy: ''
};

console.log("=== Testing Active Nodule Logic (noduleFlowAlgorithm.ts) ===");

function runTest(name: string, input: NoduleCaseInput, expected: { action: string, pattern?: string }) {
    console.log(`\nTest: ${name}`);
    const result = evaluateThyroidNoduleFlow(input);

    let pass = true;
    if (result.action !== expected.action) {
        console.log(`❌ Action Mismatch: Expected '${expected.action}', got '${result.action}'`);
        pass = false;
    }
    if (expected.pattern && result.assigned_pattern !== expected.pattern) {
        console.log(`❌ Pattern Mismatch: Expected '${expected.pattern}', got '${result.assigned_pattern}'`);
        pass = false;
    }

    if (pass) console.log("✅ PASS");
}

// === SCAN OVERRIDE TESTS ===

// 1. Hot Nodule + Concordant = TREAT_HYPERTHYROIDISM (Override)
runTest("Hot Nodule + Concordant = Hyperthyroid Treatment", {
    ...baseInput,
    scan_pattern: 'hot_nodule',
    scan_concordant: true,
    features: { ...baseInput.features, max_diameter_mm: 20 }
}, { action: 'TREAT_HYPERTHYROIDISM' });

// 2. Hot Nodule + Mismatch = Standard Biopsy Logic
runTest("Hot Nodule + Mismatch = Standard Logic", {
    ...baseInput,
    scan_pattern: 'hot_nodule',
    scan_concordant: false,
    guideline: 'ATA',
    features: { ...baseInput.features, calcifications: 'microcalcifications', max_diameter_mm: 15 }
}, { action: 'FNA_PRIMARY', pattern: 'High Suspicion' });

// 3. Graves' Pattern = Standard Logic (No Override)
runTest("Graves Pattern = Standard Logic", {
    ...baseInput,
    scan_pattern: 'diffuse_graves',
    guideline: 'ATA',
    features: { ...baseInput.features, calcifications: 'microcalcifications', max_diameter_mm: 15 }
}, { action: 'FNA_PRIMARY', pattern: 'High Suspicion' });

// 4. Cold Nodule = Standard Logic
runTest("Cold Nodule = Standard Logic", {
    ...baseInput,
    scan_pattern: 'cold_nodule',
    guideline: 'ATA',
    features: { ...baseInput.features, calcifications: 'microcalcifications', max_diameter_mm: 15 }
}, { action: 'FNA_PRIMARY', pattern: 'High Suspicion' });

// === STANDARD ULTRASOUND TESTS ===

// 5. ATA High Suspicion
runTest("ATA High Suspicion (>1cm)", {
    ...baseInput,
    guideline: 'ATA',
    features: { ...baseInput.features, composition: 'solid', echogenicity: 'hypoechoic', calcifications: 'microcalcifications', max_diameter_mm: 12 }
}, { action: 'FNA_PRIMARY', pattern: 'High Suspicion' });

// 6. ACR Manual TR5
runTest("ACR Manual TR5 (15mm)", {
    ...baseInput,
    guideline: 'ACR',
    manual_ti_rads_level: 'TR5',
    features: { ...baseInput.features, max_diameter_mm: 15 }
}, { action: 'FNA_PRIMARY', pattern: 'TR5' });

// 7. ACR Manual TR2 (No FNA)
runTest("ACR Manual TR2 (40mm) = No FNA", {
    ...baseInput,
    guideline: 'ACR',
    manual_ti_rads_level: 'TR2',
    features: { ...baseInput.features, max_diameter_mm: 40 }
}, { action: 'NO_FNA_ROUTINE', pattern: 'TR2' });

console.log("\n=== Finished Testing Active Logic ===");
