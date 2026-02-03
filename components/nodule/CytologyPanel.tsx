
import React from 'react';
import { NoduleCaseInput } from '../../types';
import { SelectField, CheckboxField } from '../FormControls';

interface CytologyPanelProps {
    input: NoduleCaseInput;
    setInput: (update: Partial<NoduleCaseInput>) => void;
}

const bethesdaOptions = [
    { value: "I", label: "I: Nondiagnostic" },
    { value: "II", label: "II: Benign" },
    { value: "III", label: "III: AUS/FLUS" },
    { value: "IV", label: "IV: Follicular Neoplasm" },
    { value: "V", label: "V: Suspicious for Malignancy" },
    { value: "VI", label: "VI: Malignant" }
];

const rcpathOptions = [
    { value: "Thy1/1c", label: "Thy1/1c: Nondiagnostic" },
    { value: "Thy2/2c", label: "Thy2/2c: Benign" },
    { value: "Thy3a", label: "Thy3a: Atypia (AUS)" },
    { value: "Thy3f", label: "Thy3f: Follicular Neoplasm" },
    { value: "Thy4", label: "Thy4: Suspicious for Malignancy" },
    { value: "Thy5", label: "Thy5: Malignant" }
];

const nodeFnaResultOptions = [
    { value: "", label: "Select..." },
    { value: "positive_tg", label: "Positive (Tg Washout Elevated)" },
    { value: "positive_calcitonin", label: "Positive (Calcitonin Washout Elevated)" },
    { value: "negative", label: "Negative / Benign" },
    { value: "non_diagnostic", label: "Non-Diagnostic" }
];

export const CytologyPanel: React.FC<CytologyPanelProps> = ({ input, setInput }) => {
    return (
        <div className="space-y-6">
            {/* Primary Nodule Cytology */}
            <div>
                <h3 className="text-lg font-medium text-stone-700 border-b pb-2">Step 4: Cytology Result (Post-FNA)</h3>
                <p className="text-sm text-stone-600 mt-2">If a biopsy was performed, enter the pathology result below to determine the next action.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <SelectField
                        label="Cytology System"
                        value={input.cytology_system}
                        onChange={e => setInput({ cytology_system: e.target.value as any })}
                        options={[{ value: 'Bethesda', label: 'Bethesda System' }, { value: 'RCPath_Thy', label: 'RCPath (UK) System' }]}
                    />
                    {input.cytology_system === 'Bethesda' ? (
                        <SelectField
                            label="Bethesda Category"
                            value={input.bethesda_cat}
                            onChange={e => setInput({ bethesda_cat: e.target.value as any })}
                            options={bethesdaOptions}
                        />
                    ) : (
                        <SelectField
                            label="RCPath Thy Category"
                            value={input.rcpath_thy}
                            onChange={e => setInput({ rcpath_thy: e.target.value as any })}
                            options={rcpathOptions}
                        />
                    )}
                </div>
            </div>

            {/* Conditional Node FNA Section */}
            {input.node_suspicious && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg space-y-4">
                    <div className="flex items-center space-x-2">
                        <span className="text-amber-600 text-lg">⚠️</span>
                        <h4 className="font-semibold text-amber-800">Suspicious Lymph Node FNA</h4>
                    </div>
                    <p className="text-sm text-amber-700">
                        You indicated a suspicious cervical lymph node. If FNA with washout was performed on the node, enter the result below.
                    </p>

                    <CheckboxField
                        id="node_fna_performed"
                        label="Node FNA Performed (with Tg/Calcitonin Washout)"
                        checked={input.node_fna_performed || false}
                        onChange={e => setInput({ node_fna_performed: e.target.checked, node_fna_result: e.target.checked ? input.node_fna_result : '' })}
                    />

                    {input.node_fna_performed && (
                        <div className="pl-6 border-l-2 border-amber-300">
                            <SelectField
                                label="Node FNA Result"
                                value={input.node_fna_result || ''}
                                onChange={e => setInput({ node_fna_result: e.target.value as any })}
                                options={nodeFnaResultOptions}
                            />
                            <p className="text-xs text-amber-600 mt-2 italic">
                                A positive Tg washout confirms cN1 nodal metastasis (DTC). Positive calcitonin suggests MTC.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
