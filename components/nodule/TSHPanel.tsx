
import React from 'react';
import { NoduleCaseInput } from '../../types';
import { InputField, SelectField, CheckboxField } from '../FormControls';
import { AlertBanner } from '../AlertBanner';

interface TSHPanelProps {
    input: NoduleCaseInput;
    setInput: (update: Partial<NoduleCaseInput>) => void;
}

const scanPatternOptions = [
    { value: 'not_performed', label: 'Not Performed / Unknown' },
    { value: 'hot_nodule', label: 'Hot Nodule (Toxic Adenoma)' },
    { value: 'diffuse_graves', label: "Diffuse Uptake (Graves' Pattern)" },
    { value: 'patchy_mng', label: 'Patchy Uptake (Multinodular Goiter)' },
    { value: 'cold_nodule', label: 'Cold Nodule (Photopenic)' },
    { value: 'indeterminate_warm', label: 'Indeterminate / Warm' },
];

export const TSHPanel: React.FC<TSHPanelProps> = ({ input, setInput }) => {

    const isLowTSH = input.TSH !== null && input.TSH < 0.4;
    const isHotNoduleConcordant = input.scan_pattern === 'hot_nodule' && input.scan_concordant === true;
    const showConcordanceToggle = input.scan_pattern === 'hot_nodule' || input.scan_pattern === 'patchy_mng';

    // Show warning only for low TSH OR concordant hot nodule
    const showHotNoduleWarning = isHotNoduleConcordant;
    const showLowTSHWarning = isLowTSH && input.scan_pattern === 'not_performed';

    // Determine the specific warning message
    let warningMessage = '';
    let warningType: 'warning' | 'info' | 'success' = 'warning';

    if (isHotNoduleConcordant) {
        warningMessage = "Scan confirms Toxic Adenoma. Biopsy is NOT indicated (Hot Nodule override). Proceed to Hyperthyroid Treatment.";
        warningType = 'success';
    } else if (input.scan_pattern === 'hot_nodule' && input.scan_concordant === false) {
        warningMessage = "Discordant findings. The suspicious nodule does not match the hot spot. Treat as a cold nodule and biopsy if size criteria are met.";
        warningType = 'warning';
    } else if (input.scan_pattern === 'diffuse_graves') {
        warningMessage = "Graves' pattern detected. Nodule is non-functioning against a hot background. Follow standard Ultrasound biopsy criteria.";
        warningType = 'info';
    } else if (showLowTSHWarning) {
        warningMessage = "Low TSH detected. Consider obtaining a radionuclide scan to rule out a hyperfunctioning nodule.";
        warningType = 'warning';
    }

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium text-stone-700 border-b pb-2">Step 1: TSH & Scintigraphy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                    label="Serum TSH (mIU/L)"
                    type="number"
                    value={input.TSH ?? ''}
                    onChange={(e) => setInput({ TSH: e.target.value === '' ? null : Number(e.target.value) })}
                    error={input.TSH === null ? "TSH is required" : ""}
                />
                <SelectField
                    label="Radionuclide Scan Pattern"
                    value={input.scan_pattern}
                    onChange={e => setInput({ scan_pattern: e.target.value as any, scan_concordant: undefined })}
                    options={scanPatternOptions}
                />
            </div>

            {showConcordanceToggle && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-3">
                    <p className="text-sm font-medium text-amber-800">
                        Does the hot area on the scan match the position of the suspicious nodule on Ultrasound?
                    </p>
                    <div className="flex space-x-4">
                        <button
                            type="button"
                            onClick={() => setInput({ scan_concordant: true })}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${input.scan_concordant === true
                                    ? 'bg-green-600 text-white'
                                    : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-50'
                                }`}
                        >
                            Yes (Match)
                        </button>
                        <button
                            type="button"
                            onClick={() => setInput({ scan_concordant: false })}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${input.scan_concordant === false
                                    ? 'bg-red-600 text-white'
                                    : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-50'
                                }`}
                        >
                            No (Mismatch)
                        </button>
                    </div>
                </div>
            )}

            {warningMessage && (
                <AlertBanner
                    type={warningType}
                    message={warningMessage}
                />
            )}

            {/* Legacy checkbox for edge cases where user wants to proceed anyway */}
            {(isLowTSH || (input.scan_pattern !== 'not_performed' && input.scan_pattern !== 'cold_nodule')) && !isHotNoduleConcordant && (
                <CheckboxField
                    label="Continue evaluation anyway (e.g., clinically suspicious features)"
                    checked={input.continue_despite_low_tsh}
                    onChange={(e) => setInput({ continue_despite_low_tsh: e.target.checked })}
                />
            )}
        </div>
    );
};
