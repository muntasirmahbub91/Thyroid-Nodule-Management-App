
import React, { useState } from 'react';
import { CaseInput, AdjuvantOutput } from '../types';
import { InputField, SelectField, CheckboxField } from './FormControls';
import { ClipboardCopyIcon, LightBulbIcon } from './Icons';

interface ThyroidAdjuvantPanelProps {
    input: CaseInput;
    setInput: (update: Partial<CaseInput>) => void;
    errors: Record<string, string>;
    onCalculate: () => void;
    result?: AdjuvantOutput;
}

const DTCInputs: React.FC<Omit<ThyroidAdjuvantPanelProps, 'onCalculate' | 'result'>> = ({ input, setInput, errors }) => {
    const neckDissectionPerformed = input.neck_dissection_performed ?? false;

    return (
        <div className="space-y-4">
            <h4 className="font-semibold text-stone-600">DTC Post-Op Data</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField label="Index Surgery" value={input.index_surgery || ''} onChange={e => setInput({ index_surgery: e.target.value as any })} options={[{value: 'lobectomy', label: 'Lobectomy'}, {value: 'total_thyroidectomy', label: 'Total Thyroidectomy'}]} error={errors.index_surgery} />
                <InputField label="Largest Focus (cm)" type="number" value={input.largest_focus_cm ?? ''} onChange={e => setInput({ largest_focus_cm: e.target.value === '' ? undefined : Number(e.target.value) })} error={errors.largest_focus_cm} />
                <SelectField label="Margin Status" value={input.margin_status || ''} onChange={e => setInput({ margin_status: e.target.value as any })} options={[{value: 'negative', label: 'Negative'}, {value: 'close', label: 'Close'}, {value: 'positive', label: 'Positive'}]} error={errors.margin_status} />
                <InputField label="Unstimulated Tg (ng/mL)" type="number" value={input.tg_unstim_ng_ml ?? ''} onChange={e => setInput({ tg_unstim_ng_ml: e.target.value === '' ? undefined : Number(e.target.value) })} error={errors.tg_unstim_ng_ml} />
            </div>

            <div className="space-y-2 pt-4 border-t mt-4">
                <h5 className="font-medium text-stone-600">Nodal Pathology</h5>
                <CheckboxField 
                    label="Neck Dissection Performed" 
                    checked={neckDissectionPerformed}
                    onChange={e => {
                        const isChecked = e.target.checked;
                        const update: Partial<CaseInput> = { neck_dissection_performed: isChecked };
                        if (!isChecked) {
                            // Clear nodal data if unchecked
                            update.N_pattern = undefined;
                            update.nodes_positive_count = undefined;
                        }
                        setInput(update);
                    }} 
                />
                {neckDissectionPerformed && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 pl-4 border-l-2 border-stone-200">
                        <SelectField label="Nodal Pattern (Pathologic)" value={input.N_pattern || ''} onChange={e => setInput({ N_pattern: e.target.value as any })} options={[{value: 'N0', label: 'N0'}, {value: 'N1a_tiny', label: 'N1a (tiny mets)'}, {value: 'N1a_micro', label: 'N1a (microscopic)'}, {value: 'N1a', label: 'N1a (macroscopic)'}, {value: 'N1b', label: 'N1b'}]} />
                        <InputField label="# Positive Nodes" type="number" value={input.nodes_positive_count ?? ''} onChange={e => setInput({ nodes_positive_count: e.target.value === '' ? undefined : Number(e.target.value) })} />
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2">
                <CheckboxField label="Gross ETE" checked={input.gross_ETE || false} onChange={e => setInput({ gross_ETE: e.target.checked })} />
                <CheckboxField label="Lymphatic Invasion" checked={input.lymphatic_invasion || false} onChange={e => setInput({ lymphatic_invasion: e.target.checked })} />
                <CheckboxField label="Vascular Invasion" checked={input.vascular_invasion || false} onChange={e => setInput({ vascular_invasion: e.target.checked })} />
                <CheckboxField label="Multifocal (Macroscopic)" checked={input.multifocal_macroscopic || false} onChange={e => setInput({ multifocal_macroscopic: e.target.checked })} />
                <CheckboxField label="High-Risk Variant" checked={input.hist_variant_high_risk || false} onChange={e => setInput({ hist_variant_high_risk: e.target.checked })} />
                <CheckboxField label="High-Grade Features" checked={input.differentiated_high_grade || false} onChange={e => setInput({ differentiated_high_grade: e.target.checked })} />
                <CheckboxField label="Tg Antibodies+" checked={input.tg_ab || false} onChange={e => setInput({ tg_ab: e.target.checked })} />
                <CheckboxField label="Post-op Neck US Negative" checked={input.neck_ultrasound_negative || false} onChange={e => setInput({ neck_ultrasound_negative: e.target.checked })} />
            </div>
        </div>
    );
};


const MTCInputs: React.FC<Omit<ThyroidAdjuvantPanelProps, 'onCalculate' | 'result'>> = ({ input, setInput, errors }) => (
    <div className="space-y-4">
        <h4 className="font-semibold text-stone-600">MTC Post-Op Data</h4>
        <SelectField label="Margin Status" value={input.margin_status_mtc || ''} onChange={e => setInput({ margin_status_mtc: e.target.value as any })} options={[{value: 'negative', label: 'Negative'}, {value: 'positive', label: 'Positive'}]} error={errors.margin_status_mtc} />
        <CheckboxField label="Gross Residual Disease" checked={input.gross_residual || false} onChange={e => setInput({ gross_residual: e.target.checked })} />
        <CheckboxField label="Threat to Vital Structures" checked={input.threat_vital_structures || false} onChange={e => setInput({ threat_vital_structures: e.target.checked })} />
    </div>
);

const ATCInputs: React.FC<Omit<ThyroidAdjuvantPanelProps, 'onCalculate' | 'result'>> = ({ input, setInput, errors }) => (
     <div className="space-y-4">
        <h4 className="font-semibold text-stone-600">ATC Post-Op Data</h4>
        <SelectField label="Resectability Achieved" value={input.resectable === undefined ? '' : String(input.resectable)} onChange={e => setInput({ resectable: e.target.value === '' ? undefined : e.target.value === 'true' })} options={[{value: 'true', label: 'Yes (R0/R1)'}, {value: 'false', label: 'No (R2/Unresectable)'}]} error={errors.resectable} />
        <CheckboxField label="Neoadjuvant BRAF V600E used" checked={input.BRAF_V600E_used_neoadjuvant || false} onChange={e => setInput({ BRAF_V600E_used_neoadjuvant: e.target.checked })} />
        <CheckboxField label="Neoadjuvant Targeted/IO used" checked={input.targeted_io_preop || false} onChange={e => setInput({ targeted_io_preop: e.target.checked })} />
    </div>
);


export const ThyroidAdjuvantPanel: React.FC<ThyroidAdjuvantPanelProps> = ({ input, setInput, errors, onCalculate, result }) => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    
     const handleCopySummary = () => {
        if (!result) return;
        const summary = `Adjuvant Plan: ${result.plan}.
Rationale: ${result.explain}.
${result.notes ? `Notes: ${result.notes.join(' ')}` : ''}
`;
        navigator.clipboard.writeText(summary.trim());
    };

    const renderInputs = () => {
        if (input.histology?.startsWith('DTC')) {
            return <DTCInputs input={input} setInput={setInput} errors={errors} />;
        }
        if (input.histology === 'MTC') {
            return <MTCInputs input={input} setInput={setInput} errors={errors} />;
        }
        if (input.histology === 'ATC') {
            return <ATCInputs input={input} setInput={setInput} errors={errors} />;
        }
        return <p className="text-stone-500">Select a histology type to see adjuvant inputs.</p>;
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-stone-200">
            <h3 className="text-lg font-bold text-white p-4 bg-indigo-600 rounded-t-xl flex justify-between items-center">
                <span>Adjuvant Therapy Recommendation</span>
                {result && (
                     <button onClick={handleCopySummary} className="bg-white/20 p-1.5 rounded-full text-white hover:bg-white/30 transition-all" aria-label="Copy Adjuvant Summary">
                        <ClipboardCopyIcon className="w-4 h-4" />
                    </button>
                )}
            </h3>

            <div className="p-5">
                 <div className="mb-4">
                    <CheckboxField label="RAI Contraindicated (e.g., pregnancy)" checked={input.patient?.rai_contraindicated || false} onChange={e => setInput({ patient: { ...input.patient, rai_contraindicated: e.target.checked } })} />
                </div>
                <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 w-full text-left mb-4" aria-expanded={!isCollapsed}>
                    {isCollapsed ? '▼ Show Post-Op Inputs' : '▲ Hide Post-Op Inputs'}
                </button>
                
                {!isCollapsed && (
                    <div className="space-y-6 mb-6 p-4 bg-stone-50 rounded-lg border">
                        {renderInputs()}
                        <div className="mt-4 border-t pt-4">
                             <button
                                onClick={onCalculate}
                                className="w-full bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-md"
                            >
                                Calculate Adjuvant Therapy
                            </button>
                        </div>
                    </div>
                )}

                {result ? (
                     <div className="space-y-4">
                        <div>
                            <p className="text-lg font-semibold text-indigo-800">{result.plan}</p>
                            <p className="text-stone-600 mt-1 italic">Rationale: {result.explain}</p>
                        </div>
                        {result.notes && result.notes.length > 0 && (
                            <div className="p-3 bg-indigo-50 rounded-md border border-indigo-200">
                                <h4 className="font-semibold text-sm text-indigo-700 mb-1">Notes</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm text-indigo-900">
                                    {result.notes.map((note, i) => <li key={i}>{note}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center text-stone-500 py-4">
                        <LightBulbIcon className="h-8 w-8 mx-auto text-amber-400 mb-2" />
                        <p>Enter post-op data above and calculate to see the adjuvant recommendation.</p>
                    </div>
                )}
            </div>
        </div>
    );
};