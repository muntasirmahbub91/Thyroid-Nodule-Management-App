
import { evaluateThyroidNoduleFlow } from './services/noduleFlowAlgorithm';
import { NoduleCaseInput } from './types';

const baseInput: NoduleCaseInput = {
    TSH: 2.0,
    nuclear_scan: 'unknown',
    continue_despite_low_tsh: false,
    guideline: 'ACR',
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

console.log("=== Testing ACR Manual Input Logic ===");

// Test 1: Manual TR3 override
const inputTR3: NoduleCaseInput = {
    ...baseInput,
    manual_ti_rads_level: 'TR3'
};
const resultTR3 = evaluateThyroidNoduleFlow(inputTR3);
console.log(`Test 1 (TR3, 15mm): Action=${resultTR3.action}, Level=${resultTR3.assigned_pattern}`);
if (resultTR3.assigned_pattern === 'TR3') console.log("✅ PASS: Correctly assigned TR3");
else console.log("❌ FAIL: Did not assign TR3");

// Test 2: Manual TR5 override
const inputTR5: NoduleCaseInput = {
    ...baseInput,
    manual_ti_rads_level: 'TR5'
};
const resultTR5 = evaluateThyroidNoduleFlow(inputTR5);
console.log(`Test 2 (TR5, 15mm): Action=${resultTR5.action}, Level=${resultTR5.assigned_pattern}`);
if (resultTR5.assigned_pattern === 'TR5' && resultTR5.action === 'FNA_PRIMARY') console.log("✅ PASS: Correctly assigned TR5 and FNA action");
else console.log("❌ FAIL: Did not assign TR5 or FNA action");

// Test 3: Calculate Mode (No Manual Input)
// Solid (2) + Hypoechoic (2) + Smooth (0) + Wider (0) + None (0) = 4 points = TR4
const inputCalc: NoduleCaseInput = {
    ...baseInput,
    manual_ti_rads_level: undefined
};
const resultCalc = evaluateThyroidNoduleFlow(inputCalc);
console.log(`Test 3 (Calculate TR4): Action=${resultCalc.action}, Level=${resultCalc.assigned_pattern}`);
if (resultCalc.assigned_pattern === 'TR4') console.log("✅ PASS: Correctly calculated TR4");
else console.log("❌ FAIL: Did not calculate TR4");
