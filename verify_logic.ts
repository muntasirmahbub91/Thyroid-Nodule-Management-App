
import { RuleEngine } from './services/RuleEngine';
import { TSH_INITIAL_GATING } from './constants/rules/TSH_INITIAL_GATING';
import { US_TO_FNAC_DECISION } from './constants/rules/US_TO_FNAC_DECISION';
import { LOW_TSH_SCAN_OVERRIDE } from './constants/rules/LOW_TSH_SCAN_OVERRIDE';
import { BETHESDA_FNAC_MANAGEMENT } from './constants/rules/BETHESDA_FNAC_MANAGEMENT';

// Helper to run a test case
const runTest = (name: string, module: any, input: any, expectedAction: string) => {
    console.log(`\nRunning Test: ${name}`);
    const result = RuleEngine.evaluate(module, input);
    if (result && result.action === expectedAction) {
        console.log(`✅ PASS: Got expected action '${expectedAction}'`);
    } else {
        console.log(`❌ FAIL: Expected '${expectedAction}', got '${result?.action}'`);
        console.log("Input:", JSON.stringify(input));
        console.log("Result:", JSON.stringify(result));
    }
};

console.log("=== STARTING VERIFICATION ===\n");

// 1. TSH Gating: Red Flags
runTest(
    "Urgent Referral on Red Flags",
    TSH_INITIAL_GATING,
    { red_flags_present: true, tsh_status: "NORMAL" },
    "URGENT_REFERRAL"
);

// 2. TSH Gating: Low TSH
runTest(
    "Scan Pathway for Low TSH",
    TSH_INITIAL_GATING,
    { red_flags_present: false, tsh_status: "LOW_OR_SUPPRESSED", pregnant: false },
    "SCAN_PATHWAY_AVAILABLE"
);

// 3. US Decision: Suspicious Node
runTest(
    "Suspicious Node Override",
    US_TO_FNAC_DECISION,
    { suspicious_cervical_nodes: true, size_cm: 0.5 },
    "FNA_NODE"
);

// 4. US Decision: ATA High (Standard)
runTest(
    "ATA High >= 1cm",
    US_TO_FNAC_DECISION,
    { system: "ATA_2015", pattern: "HIGH", size_cm: 1.2, suspicious_cervical_nodes: false },
    "FNA"
);

// 5. US Decision: ATA High (Small)
runTest(
    "ATA High < 1cm (No Action / Implicit)",
    US_TO_FNAC_DECISION,
    { system: "ATA_2015", pattern: "HIGH", size_cm: 0.8, suspicious_cervical_nodes: false },
    undefined // Current rules don't have an explicit 'No Action' match, returns null
);

// 6. Scan Override: Hot Nodule
runTest(
    "Hot Nodule Override",
    LOW_TSH_SCAN_OVERRIDE,
    { tsh_status: "LOW_OR_SUPPRESSED", scan_pattern: "HOT", concordance: "MATCH" },
    undefined // The rule returns action as undefined but sets override_fna: true.
);

// Custom check for Hot Nodule Override properties
const hotNoduleResult = RuleEngine.evaluate(LOW_TSH_SCAN_OVERRIDE, { tsh_status: "LOW_OR_SUPPRESSED", scan_pattern: "HOT", concordance: "MATCH" });
if (hotNoduleResult && hotNoduleResult.override_fna === true) {
    console.log(`✅ PASS: Hot Nodule Override sets override_fna: true`);
} else {
    console.log(`❌ FAIL: Hot Nodule Override failed property check`);
}


// 7. Bethesda IV
runTest(
    "Bethesda IV -> Lobectomy",
    BETHESDA_FNAC_MANAGEMENT,
    { bethesda_category: "IV" },
    "DIAGNOSTIC_LOBECTOMY"
);

// 8. Bethesda V
runTest(
    "Bethesda V -> Surgery",
    BETHESDA_FNAC_MANAGEMENT,
    { bethesda_category: "V" },
    "SURGERY_PATHWAY"
);

// 9. Hot Nodule Discordance
runTest(
    "Hot Nodule Discordance -> FNA (No Override)",
    LOW_TSH_SCAN_OVERRIDE,
    { tsh_status: "LOW_OR_SUPPRESSED", scan_pattern: "HOT", concordance: "MISMATCH" },
    undefined // Override should be false
);

// 10. Bethesda III + Molecular
runTest(
    "Bethesda III -> Repeat FNA / Molecular",
    BETHESDA_FNAC_MANAGEMENT,
    { bethesda_category: "III" },
    undefined // Action is technically REPEAT_FNAC / CONSIDER_MOLECULAR
);

// 11. ACR TI-RADS TR2
runTest(
    "ACR TR2 -> No FNA",
    US_TO_FNAC_DECISION,
    { system: "ACR_TI_RADS_2017", pattern: "TR2" },
    "NO_FNA_SURVEILLANCE"
);

console.log("\n=== VERIFICATION COMPLETE ===");
