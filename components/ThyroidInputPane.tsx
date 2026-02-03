import React from 'react';
import { CaseInput, ThyroidHistology } from '../types';
import { InputField, SelectField, CheckboxField } from './FormControls';

interface ThyroidInputPaneProps {
    input: CaseInput;
    setInput: (update: Partial<CaseInput>) => void;
    errors: Record<string, string>;
}

const thyroidHistologies: { value: ThyroidHistology; label: string }[] = [
    { value: 'DTC_papillary', label: 'DTC - Papillary' },
    { value: 'DTC_follicular', label: 'DTC - Follicular' },
    { value: 'DTC_oncocytic', label: 'DTC - Oncocytic' },
    { value: 'MTC', label: 'Medullary (MTC)' },
    { value: 'ATC', label: 'Anaplastic (ATC)' },
];

const etePlanes = [
    { id: 'strap', label: 'Strap Muscles' },
    { id: 'subcut', label: 'Subcutaneous Tissue' },
    { id: 'larynx', label: 'Larynx, Trachea, Esophagus, or RLN' },
    { id: 'prevertebral', label: 'Prevertebral Fascia' },
    { id: 'carotid/mediastinal', label: 'Carotid Artery or Mediastinal Vessels' },
]

export const ThyroidInputPane: React.FC<ThyroidInputPaneProps> = ({ input, setInput, errors }) => {
    
    const handleNestedChange = (section: 'patient' | 'biomarkers' | 'primary' | 'nodes' | 'metastasis' | 'staging', field: string, value: any) => {
        setInput({ [section]: { ...(input[section] || {}), [field]: value } } as Partial<CaseInput>);
    };
    
    const handleDeeplyNestedChange = (section: 'nodes', subSection: 'levels', field: string, value: any) => {
        const currentSection = input[section] as any;
        const currentSubSection = currentSection?.[subSection];
        setInput({
            [section]: {
                ...(currentSection || {}),
                [subSection]: {
                    ...(currentSubSection || {}),
                    [field]: value,
                },
            },
        } as Partial<CaseInput>);
    };


    const handleProvenancedChange = (section: 'primary' | 'nodes', field: string, value: any) => {
        setInput({ [section]: { ...(input[section] || {}), [field]: { value } } } as Partial<CaseInput>);
    };
    
    const handleEteChange = (planeId: string, isChecked: boolean) => {
        const currentPlanes = input.primary?.grossEtePlanes || [];
        const newPlanes = isChecked
            ? [...currentPlanes, planeId]
            : currentPlanes.filter(p => p !== planeId);
        setInput({ primary: { ...(input.primary || {}), grossEtePlanes: newPlanes } });
    };

    return (
        <div className="space-y-6">
            {input.prior_surgery_summary && (
                <div className="p-4 bg-teal-50 border-l-4 border-teal-400 rounded-r-lg">
                    <h4 className="font-bold text-teal-800">{input.prior_surgery_summary.surgery}</h4>
                    <ul className="list-disc list-inside text-sm text-teal-700 mt-2">
                        {input.prior_surgery_summary.details.map((detail, i) => <li key={i}>{detail}</li>)}
                    </ul>
                </div>
            )}
            <h3 className="text-lg font-medium text-stone-700 border-b pb-2">Patient & Disease Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <SelectField label="Histology" value={input.histology || ''} onChange={(e) => setInput({ histology: e.target.value as ThyroidHistology })} options={thyroidHistologies} />
                 <InputField label="Patient Age (years)" type="number" value={input.patient?.age_years || ''} onChange={(e) => handleNestedChange('patient', 'age_years', Number(e.target.value))} />
                  {input.histology === 'ATC' && <CheckboxField label="BRAF V600E+" checked={input.biomarkers?.braf_v600e || false} onChange={(e) => handleNestedChange('biomarkers', 'braf_v600e', e.target.checked)} />}

            </div>
            
            {input.histology === 'MTC' && (
                <>
                    <h3 className="text-lg font-medium text-stone-700 border-b pb-2">MTC-Specific Workup</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField 
                            label="Pre-Op Calcitonin (pg/mL)" 
                            type="number" 
                            value={input.biomarkers?.calcitonin_pg_ml || ''} 
                            onChange={(e) => handleNestedChange('biomarkers', 'calcitonin_pg_ml', e.target.value === '' ? undefined : Number(e.target.value))} 
                        />
                        <InputField 
                            label="Pre-Op CEA (ng/mL)" 
                            type="number" 
                            value={input.biomarkers?.cea_ng_ml || ''} 
                            onChange={(e) => handleNestedChange('biomarkers', 'cea_ng_ml', e.target.value === '' ? undefined : Number(e.target.value))} 
                        />
                        <SelectField 
                            label="RET Germline Test"
                            value={input.biomarkers?.ret_germline_result || ''}
                            onChange={(e) => handleNestedChange('biomarkers', 'ret_germline_result', e.target.value as any)}
                            options={[
                                { value: 'pathogenic', label: 'Pathogenic' },
                                { value: 'VUS', label: 'VUS' },
                                { value: 'negative', label: 'Negative' },
                            ]}
                        />
                    </div>
                     <div className="mt-4 p-3 bg-amber-50 border-l-4 border-amber-400">
                         <CheckboxField 
                            label="Pheochromocytoma Ruled Out" 
                            checked={input.patient?.pheochromocytoma_ruled_out || false} 
                            onChange={(e) => handleNestedChange('patient', 'pheochromocytoma_ruled_out', e.target.checked)} 
                        />
                        <p className="text-xs text-stone-600 ml-6">This is a critical pre-operative safety check for all MTC patients.</p>
                     </div>
                </>
            )}

             <h3 className="text-lg font-medium text-stone-700 border-b pb-2">Primary Tumor (T)</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Size (cm)" type="number" value={input.primary?.size_cm?.value || ''} onChange={(e) => handleProvenancedChange('primary', 'size_cm', Number(e.target.value))} error={errors.size_cm}/>
             </div>
             <div className="mt-4">
                <label className="block text-sm font-medium text-stone-600 mb-2">Gross Extrathyroidal Extension (ETE) Planes</label>
                <div className="space-y-2 pl-2">
                    {etePlanes.map(plane => (
                        <CheckboxField 
                            key={plane.id}
                            label={plane.label}
                            checked={input.primary?.grossEtePlanes?.includes(plane.id) || false}
                            onChange={(e) => handleEteChange(plane.id, e.target.checked)}
                        />
                    ))}
                </div>
             </div>

            <h3 className="text-lg font-medium text-stone-700 border-b pb-2">Nodes (N)</h3>
            <div className="space-y-2">
                 <CheckboxField 
                    label="Central Compartment (VI) or Upper Mediastinal (VII) Nodes Involved" 
                    checked={input.nodes?.levels?.level_vi_vii || false} 
                    onChange={(e) => handleDeeplyNestedChange('nodes', 'levels', 'level_vi_vii', e.target.checked)}
                />
                <CheckboxField 
                    label="Lateral Neck (I-V) or Retropharyngeal Nodes Involved" 
                    checked={input.nodes?.levels?.lateral_neck_or_retropharyngeal || false} 
                    onChange={(e) => handleDeeplyNestedChange('nodes', 'levels', 'lateral_neck_or_retropharyngeal', e.target.checked)}
                />
                 <CheckboxField 
                    label="Invasion of SAN, IJV, or SCM" 
                    checked={input.nodes?.invasion_of_critical_structures || false} 
                    onChange={(e) => handleNestedChange('nodes', 'invasion_of_critical_structures', e.target.checked)}
                />
            </div>

            <h3 className="text-lg font-medium text-stone-700 border-b pb-2">Metastasis (M)</h3>
            <CheckboxField label="Confirmed Metastasis" checked={input.metastasis?.confirmed || false} onChange={(e) => handleNestedChange('metastasis', 'confirmed', e.target.checked)} />
        </div>
    );
};