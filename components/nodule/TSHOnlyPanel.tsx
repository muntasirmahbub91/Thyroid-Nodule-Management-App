
import React from 'react';
import { NoduleCaseInput } from '../../types';
import { InputField, SelectField } from '../FormControls';
import { AlertBanner } from '../AlertBanner';

interface TSHOnlyPanelProps {
    input: NoduleCaseInput;
    setInput: (update: Partial<NoduleCaseInput>) => void;
}

const sexOptions = [
    { value: '', label: 'Select Sex' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
];

export const TSHOnlyPanel: React.FC<TSHOnlyPanelProps> = ({ input, setInput }) => {
    const isLowTSH = input.TSH !== null && input.TSH < 0.4;

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium text-stone-700 border-b pb-2">Step 1: Serum TSH</h3>
            <p className="text-sm text-stone-500">
                Enter patient demographics and serum TSH to begin the evaluation.
            </p>

            {/* Patient Demographics */}
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                <h4 className="text-sm font-semibold text-indigo-700 mb-3">Patient Demographics</h4>
                <div className="grid grid-cols-2 gap-4">
                    <InputField
                        label="Age (years)"
                        type="number"
                        value={input.patient_age ?? ''}
                        onChange={(e) => setInput({ patient_age: e.target.value === '' ? null : Number(e.target.value) })}
                        placeholder="e.g., 45"
                    />
                    <SelectField
                        label="Sex"
                        value={input.patient_sex}
                        onChange={(e) => setInput({ patient_sex: e.target.value as 'male' | 'female' | '' })}
                        options={sexOptions}
                    />
                </div>
                <p className="text-xs text-indigo-600 mt-2">
                    Age is used for AJCC staging. Male sex may lower biopsy thresholds.
                </p>
            </div>

            {/* TSH Input */}
            <div className="max-w-xs">
                <InputField
                    label="Serum TSH (mIU/L)"
                    type="number"
                    value={input.TSH ?? ''}
                    onChange={(e) => setInput({ TSH: e.target.value === '' ? null : Number(e.target.value) })}
                    error={input.TSH === null ? "TSH is required to proceed" : ""}
                />
            </div>

            {isLowTSH && (
                <AlertBanner
                    type="warning"
                    message="Low TSH detected (<0.4 mIU/L). A radionuclide thyroid scan is recommended to evaluate for a hyperfunctioning nodule."
                />
            )}

            {input.TSH !== null && !isLowTSH && (
                <AlertBanner
                    type="info"
                    message="TSH is normal or elevated. Proceed directly to ultrasound evaluation."
                />
            )}
        </div>
    );
};
