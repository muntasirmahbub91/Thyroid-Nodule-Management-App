
import React from 'react';
import { NoduleCaseInput } from '../../types';
import { SelectField } from '../FormControls';
import { AlertBanner } from '../AlertBanner';

interface RadionuclideScanPanelProps {
    input: NoduleCaseInput;
    setInput: (update: Partial<NoduleCaseInput>) => void;
}

const scanPatternOptions = [
    { value: 'not_performed', label: 'Scan Not Performed' },
    { value: 'hot_nodule', label: 'Hot Nodule (Toxic Adenoma)' },
    { value: 'diffuse_graves', label: "Diffuse Uptake (Graves' Pattern)" },
    { value: 'patchy_mng', label: 'Patchy Uptake (Multinodular Goiter)' },
    { value: 'cold_nodule', label: 'Cold Nodule (Photopenic)' },
    { value: 'indeterminate_warm', label: 'Indeterminate / Warm' },
];

export const RadionuclideScanPanel: React.FC<RadionuclideScanPanelProps> = ({ input, setInput }) => {
    const showConcordanceToggle = input.scan_pattern === 'hot_nodule' || input.scan_pattern === 'patchy_mng';
    const isHotNoduleConcordant = input.scan_pattern === 'hot_nodule' && input.scan_concordant === true;

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium text-stone-700 border-b pb-2">Step 2: Radionuclide Thyroid Scan</h3>
            <p className="text-sm text-stone-500">
                With low TSH, a radionuclide scan helps identify if the nodule is hyperfunctioning ("hot").
                Hot nodules have very low malignancy risk and typically do not require biopsy.
            </p>

            <div className="max-w-md">
                <SelectField
                    label="Scan Pattern"
                    value={input.scan_pattern}
                    onChange={e => setInput({ scan_pattern: e.target.value as any, scan_concordant: undefined })}
                    options={scanPatternOptions}
                />
            </div>

            {/* Concordance Check */}
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

            {/* Result Messages - keep neutral, recommendations appear in ActionCard after USG */}
            {isHotNoduleConcordant && (
                <AlertBanner
                    type="success"
                    message="Hot nodule confirmed (scan and ultrasound concordant). Continue to USG to complete evaluation."
                />
            )}

            {input.scan_pattern === 'hot_nodule' && input.scan_concordant === false && (
                <AlertBanner
                    type="warning"
                    message="Discordant findings. The suspicious nodule does not match the hot spot. Treat as a cold nodule and continue to ultrasound evaluation."
                />
            )}

            {input.scan_pattern === 'diffuse_graves' && (
                <AlertBanner
                    type="info"
                    message="Graves' pattern detected. The nodule is non-functioning against a hot background. Continue to ultrasound evaluation with standard biopsy criteria."
                />
            )}

            {(input.scan_pattern === 'cold_nodule' || input.scan_pattern === 'indeterminate_warm') && (
                <AlertBanner
                    type="info"
                    message="Cold or indeterminate nodule. Continue to ultrasound evaluation. Standard biopsy criteria apply."
                />
            )}

            {input.scan_pattern === 'patchy_mng' && input.scan_concordant === undefined && (
                <AlertBanner
                    type="warning"
                    message="Patchy uptake detected. Please confirm if the hot spot matches the suspicious nodule on ultrasound."
                />
            )}
        </div>
    );
};
