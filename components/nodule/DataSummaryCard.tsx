import React from 'react';
import { NoduleCaseInput, ActionOut } from '../../types';

interface DataSummaryCardProps {
    input: NoduleCaseInput;
    result: ActionOut;
}

const formatTSH = (tsh: number | null): string => {
    if (tsh === null) return 'Not provided';
    if (tsh < 0.4) return `${tsh} mIU/L (Low)`;
    if (tsh > 4.0) return `${tsh} mIU/L (High)`;
    return `${tsh} mIU/L (Normal)`;
};

const scanPatternLabels: Record<string, string> = {
    'not_performed': 'Not Performed',
    'hot_nodule': 'Hot Nodule (Toxic Adenoma)',
    'diffuse_graves': "Diffuse Uptake (Graves' Pattern)",
    'patchy_mng': 'Patchy Uptake (MNG)',
    'cold_nodule': 'Cold Nodule',
    'indeterminate_warm': 'Indeterminate/Warm'
};

const compositionLabels: Record<string, string> = {
    'solid': 'Solid',
    'part_cystic': 'Partially Cystic',
    'pure_cyst': 'Pure Cyst',
    'spongiform': 'Spongiform'
};

const echogenicityLabels: Record<string, string> = {
    'hyperechoic': 'Hyperechoic',
    'isoechoic': 'Isoechoic',
    'hypoechoic': 'Hypoechoic',
    'markedly_hypoechoic': 'Markedly Hypoechoic'
};

const marginsLabels: Record<string, string> = {
    'smooth': 'Smooth/Well-defined',
    'ill_defined': 'Ill-defined',
    'lobulated': 'Lobulated',
    'irregular': 'Irregular'
};

const shapeLabels: Record<string, string> = {
    'wider_than_tall': 'Wider than Tall',
    'taller_than_wide': 'Taller than Wide'
};

const calcificationLabels: Record<string, string> = {
    'none': 'None',
    'microcalcifications': 'Microcalcifications',
    'macrocalcifications': 'Macrocalcifications',
    'peripheral': 'Peripheral (Rim)'
};

const bethesdaLabels: Record<string, string> = {
    'I': 'I: Non-diagnostic',
    'II': 'II: Benign',
    'III': 'III: AUS/FLUS',
    'IV': 'IV: Follicular Neoplasm',
    'V': 'V: Suspicious for Malignancy',
    'VI': 'VI: Malignant'
};

const rcpathLabels: Record<string, string> = {
    'Thy1': 'Thy1: Non-diagnostic',
    'Thy1c': 'Thy1c: Cyst Fluid Only',
    'Thy2': 'Thy2: Non-neoplastic',
    'Thy2c': 'Thy2c: Non-neoplastic Cystic',
    'Thy3a': 'Thy3a: Atypia',
    'Thy3f': 'Thy3f: Follicular Neoplasm',
    'Thy4': 'Thy4: Suspicious for Malignancy',
    'Thy5': 'Thy5: Malignant'
};

export const DataSummaryCard: React.FC<DataSummaryCardProps> = ({ input, result }) => {
    const hasCytology = (input.cytology_system === 'Bethesda' && input.bethesda_cat) ||
        (input.cytology_system === 'RCPath_Thy' && input.rcpath_thy);

    return (
        <div className="bg-white rounded-xl shadow-lg border border-stone-200 mb-4">
            <h3 className="text-lg font-bold text-stone-700 p-4 bg-stone-100 rounded-t-xl border-b">
                📋 Evaluated Data Points
            </h3>
            <div className="p-4 space-y-4">
                {/* Patient Demographics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-lg">
                        <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Age</div>
                        <div className="text-sm font-medium text-stone-800">
                            {input.patient_age !== null ? `${input.patient_age} years` : 'Not provided'}
                            {input.patient_age !== null && (
                                <span className={`ml-2 text-xs px-2 py-0.5 rounded ${input.patient_age < 55 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {input.patient_age < 55 ? 'Stage I-II eligible' : '≥55 years'}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                        <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Sex</div>
                        <div className="text-sm font-medium text-stone-800">
                            {input.patient_sex === 'male' ? 'Male' : input.patient_sex === 'female' ? 'Female' : 'Not provided'}
                            {input.patient_sex === 'male' && (
                                <span className="ml-2 text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700">
                                    Higher risk factor
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* TSH & Scan Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-indigo-50 p-3 rounded-lg">
                        <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">TSH</div>
                        <div className="text-sm font-medium text-stone-800">{formatTSH(input.TSH)}</div>
                    </div>
                    <div className="bg-amber-50 p-3 rounded-lg">
                        <div className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Radionuclide Scan</div>
                        <div className="text-sm font-medium text-stone-800">
                            {scanPatternLabels[input.scan_pattern] || input.scan_pattern}
                            {input.scan_concordant !== undefined && (
                                <span className={`ml-2 text-xs px-2 py-0.5 rounded ${input.scan_concordant ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {input.scan_concordant ? 'Concordant' : 'Discordant'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* USG Features */}
                <div className="bg-teal-50 p-3 rounded-lg">
                    <div className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-2">Ultrasound Features</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                        <div>
                            <span className="text-stone-500">Size:</span>{' '}
                            <span className="font-medium text-stone-800">{input.features.max_diameter_mm ? `${input.features.max_diameter_mm} mm` : '—'}</span>
                        </div>
                        <div>
                            <span className="text-stone-500">Composition:</span>{' '}
                            <span className="font-medium text-stone-800">{compositionLabels[input.features.composition] || '—'}</span>
                        </div>
                        <div>
                            <span className="text-stone-500">Echogenicity:</span>{' '}
                            <span className="font-medium text-stone-800">{echogenicityLabels[input.features.echogenicity] || '—'}</span>
                        </div>
                        <div>
                            <span className="text-stone-500">Margins:</span>{' '}
                            <span className="font-medium text-stone-800">{marginsLabels[input.features.margins] || '—'}</span>
                        </div>
                        <div>
                            <span className="text-stone-500">Shape:</span>{' '}
                            <span className="font-medium text-stone-800">{shapeLabels[input.features.shape] || '—'}</span>
                        </div>
                        <div>
                            <span className="text-stone-500">Calcifications:</span>{' '}
                            <span className="font-medium text-stone-800">{calcificationLabels[input.features.calcifications] || '—'}</span>
                        </div>
                    </div>
                </div>

                {/* Risk Pattern */}
                {result.assigned_pattern && (
                    <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">
                            Risk Classification ({input.guideline})
                        </div>
                        <div className="text-sm font-bold text-purple-800">{result.assigned_pattern}</div>
                    </div>
                )}

                {/* Suspicious Features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-rose-50 p-3 rounded-lg">
                        <div className="text-xs font-semibold text-rose-600 uppercase tracking-wide mb-1">Suspicious Features</div>
                        <div className="text-sm text-stone-800 space-y-2">
                            <div className="flex flex-col">
                                <div className="flex items-center">
                                    <span className={`w-3 h-3 mr-2 rounded-full ${input.node_suspicious ? 'bg-red-500' : 'bg-gray-300'}`}></span>
                                    <span className="font-medium">Suspicious Lymph Node:</span>
                                    <span className="ml-1">{input.node_suspicious ? 'Yes' : 'No'}</span>
                                </div>
                                {input.node_fna_performed && input.node_fna_result && (
                                    <div className="ml-5 mt-1 text-xs bg-white px-2 py-1 rounded border border-rose-200">
                                        <span className="font-bold text-rose-700">Node FNA:</span> {
                                            input.node_fna_result === 'positive_tg' ? 'Metastatic (Tg+ Washout)' :
                                                input.node_fna_result === 'positive_calcitonin' ? 'Metastatic (Calc+ Washout)' :
                                                    input.node_fna_result === 'negative' ? 'Negative' :
                                                        input.node_fna_result === 'non_diagnostic' ? 'Non-Diagnostic' : input.node_fna_result
                                        }
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center">
                                <span className={`w-3 h-3 mr-2 rounded-full ${input.calcitonin_elevated ? 'bg-red-500' : 'bg-gray-300'}`}></span>
                                <span className="font-medium">Elevated Calcitonin:</span>
                                <span className="ml-1">{input.calcitonin_elevated ? 'Yes' : 'No'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Cytology - only show if present */}
                    {hasCytology && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Cytology Result</div>
                            <div className="text-sm font-medium text-stone-800">
                                {input.cytology_system === 'Bethesda' && input.bethesda_cat && (
                                    <span>{bethesdaLabels[input.bethesda_cat] || input.bethesda_cat}</span>
                                )}
                                {input.cytology_system === 'RCPath_Thy' && input.rcpath_thy && (
                                    <span>{rcpathLabels[input.rcpath_thy] || input.rcpath_thy}</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
