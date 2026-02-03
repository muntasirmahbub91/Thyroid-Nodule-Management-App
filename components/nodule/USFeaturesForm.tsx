

import React from 'react';
import { NoduleCaseInput, USFeatures } from '../../types';
import { InputField, SelectField, CheckboxField } from '../FormControls';

interface USFeaturesFormProps {
    input: NoduleCaseInput;
    setInput: (update: Partial<NoduleCaseInput>) => void;
}

const ataCompositionOptions = [
    { value: 'solid', label: 'Solid or Almost Completely Solid' },
    { value: 'part_cystic', label: 'Mixed Cystic and Solid' },
    { value: 'spongiform', label: 'Spongiform' },
    { value: 'pure_cyst', label: 'Purely Cystic' }
];

const btaCompositionOptions = [
    { value: 'solid', label: 'Solid' },
    { value: 'part_cystic', label: 'Mixed / Partially Cystic' },
    { value: 'pure_cyst', label: 'Cystic' }
];

const ataEchogenicityOptions = [
    { value: 'markedly_hypoechoic', label: 'Markedly Hypoechoic' },
    { value: 'hypoechoic', label: 'Hypoechoic' },
    { value: 'isoechoic', label: 'Isoechoic' },
    { value: 'hyperechoic', label: 'Hyperechoic' }
];

const btaEchogenicityOptions = [
    { value: 'markedly_hypoechoic', label: 'Markedly Hypoechoic' },
    { value: 'hypoechoic', label: 'Hypoechoic' },
    { value: 'isoechoic', label: 'Isoechoic' },
];

const marginOptions = [
    { value: 'smooth', label: 'Smooth / Well-defined' },
    { value: 'ill_defined', label: 'Ill-defined' },
    { value: 'lobulated', label: 'Lobulated / Microlobulated' },
    { value: 'irregular', label: 'Irregular (spiculated)' }
];

const shapeOptions = [
    { value: 'wider_than_tall', label: 'Wider-than-tall' },
    { value: 'taller_than_wide', label: 'Taller-than-wide' },
];

const ataCalcificationOptions = [
    { value: 'none', label: 'None or Not Present' },
    { value: 'microcalcifications', label: 'Punctate Echogenic Foci (Microcalc.)' },
    { value: 'macrocalcifications', label: 'Macrocalcifications' },
];

const btaCalcificationOptions = [
    { value: 'none', label: 'None' },
    { value: 'microcalcifications', label: 'Microcalcifications' },
    { value: 'macrocalcifications', label: 'Macrocalcifications' },
];

const btaVascularityOptions = [
    { value: 'none', label: 'None (Type I)' },
    { value: 'peripheral', label: 'Peripheral (Type II)' },
    { value: 'central', label: 'Central (Type III)' },
];


const acrCompositionOptions = [
    { value: 'pure_cyst', label: 'Cystic / Almost Completely Cystic (0 pts)' },
    { value: 'spongiform', label: 'Spongiform (0 pts)' },
    { value: 'part_cystic', label: 'Mixed Cystic and Solid (1 pt)' },
    { value: 'solid', label: 'Solid or Almost Completely Solid (2 pts)' }
];

const acrEchogenicityOptions = [
    // Note: 'anechoic' is usually implied by cystic, but we map inputs. 
    // USFeatures uses 'hyperechoic', 'isoechoic', 'hypoechoic', 'markedly_hypoechoic'.
    // We'll map UI labels to these values but display points.
    { value: 'hyperechoic', label: 'Hyperechoic (1 pt)' }, // or Anechoic (0 pts) if cyst
    { value: 'isoechoic', label: 'Isoechoic (1 pt)' },
    { value: 'hypoechoic', label: 'Hypoechoic (2 pts)' },
    { value: 'markedly_hypoechoic', label: 'Very Hypoechoic (3 pts)' }
];

const acrMarginOptions = [
    { value: 'smooth', label: 'Smooth (0 pts)' },
    { value: 'ill_defined', label: 'Ill-defined (0 pts)' },
    { value: 'lobulated', label: 'Lobulated (2 pts)' },
    { value: 'irregular', label: 'Irregular (2 pts)' }, // ACR treats Irregular/Lobulated similarly (2pts)
    // Note: Extrathyroidal extension is a separate checkbox which adds 3 points in our mapped logic
];

const acrShapeOptions = [
    { value: 'wider_than_tall', label: 'Wider-than-tall (0 pts)' },
    { value: 'taller_than_wide', label: 'Taller-than-wide (3 pts)' },
];

const acrCalcificationOptions = [
    { value: 'none', label: 'None or Large Comet-tail (0 pts)' },
    { value: 'macrocalcifications', label: 'Macrocalcifications (1 pt)' },
    { value: 'peripheral', label: 'Peripheral (rim) calcifications (2 pts)' },
    { value: 'microcalcifications', label: 'Punctate Echogenic Foci (3 pts)' },
];

const trLevelOptions = [
    { value: 'TR1', label: 'TR1: Benign (0 pts)' },
    { value: 'TR2', label: 'TR2: Not Suspicious (2 pts)' },
    { value: 'TR3', label: 'TR3: Mildly Suspicious (3 pts)' },
    { value: 'TR4', label: 'TR4: Moderately Suspicious (4-6 pts)' },
    { value: 'TR5', label: 'TR5: Highly Suspicious (≥7 pts)' },
];


const PatternPill: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
    value ? (
        <div className={`text-sm font-semibold px-3 py-1 rounded-full text-center ${value.startsWith('TR') ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-800'}`}>
            {label}: {value}
        </div>
    ) : null
);

export const USFeaturesForm: React.FC<USFeaturesFormProps> = ({ input, setInput }) => {

    const handleFeatureChange = (update: Partial<USFeatures>) => {
        setInput({ features: { ...input.features, ...update } });
    };

    const isATA = input.guideline === 'ATA';
    const isACR = input.guideline === 'ACR';

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-2">
                <h3 className="text-lg font-medium text-stone-700">Step 2: Ultrasound Features</h3>
                <PatternPill label="Pattern" value={input.assigned_pattern} />
            </div>

            <div className="flex flex-col space-y-2 p-3 bg-stone-100 rounded-lg">
                <div className="flex items-center space-x-4">
                    <span className="font-semibold text-stone-700">Guideline:</span>
                    <button onClick={() => setInput({ guideline: 'ATA', manual_ti_rads_level: undefined })} className={`px-4 py-1.5 text-sm rounded-md ${isATA ? 'bg-indigo-500 text-white shadow' : 'bg-white text-stone-600 hover:bg-stone-200'}`}>ATA</button>
                    <button onClick={() => setInput({ guideline: 'ACR' })} className={`px-4 py-1.5 text-sm rounded-md ${isACR ? 'bg-blue-600 text-white shadow' : 'bg-white text-stone-600 hover:bg-stone-200'}`}>ACR TI-RADS</button>
                    <button onClick={() => setInput({ guideline: 'BTA', manual_ti_rads_level: undefined })} className={`px-4 py-1.5 text-sm rounded-md ${!isATA && !isACR ? 'bg-indigo-500 text-white shadow' : 'bg-white text-stone-600 hover:bg-stone-200'}`}>BTA (UK)</button>
                </div>

                {isACR && (
                    <div className="flex items-center space-x-4 mt-2 pt-2 border-t border-stone-200">
                        <span className="font-semibold text-stone-700 text-sm">Mode:</span>
                        <div className="flex bg-white rounded-md p-0.5 shadow-sm border border-stone-300">
                            <button
                                onClick={() => setInput({ manual_ti_rads_level: undefined })}
                                className={`px-3 py-1 text-xs rounded font-medium transition-colors ${!input.manual_ti_rads_level ? 'bg-blue-100 text-blue-800' : 'text-stone-500 hover:bg-stone-50'}`}
                            >
                                Calculate (Features)
                            </button>
                            <button
                                onClick={() => setInput({ manual_ti_rads_level: 'TR1' })}
                                className={`px-3 py-1 text-xs rounded font-medium transition-colors ${input.manual_ti_rads_level ? 'bg-blue-100 text-blue-800' : 'text-stone-500 hover:bg-stone-50'}`}
                            >
                                Manual TR Assignment
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                    label="Largest Diameter (mm)"
                    type="number"
                    value={input.features.max_diameter_mm ?? ''}
                    onChange={(e) => handleFeatureChange({ max_diameter_mm: e.target.value === '' ? null : Number(e.target.value) })}
                    error={input.features.max_diameter_mm === null ? "Nodule size is required" : ""}
                />

                {isACR && input.manual_ti_rads_level ? (
                    <SelectField
                        label="Assigned TR Level"
                        value={input.manual_ti_rads_level}
                        onChange={e => setInput({ manual_ti_rads_level: e.target.value as any })}
                        options={trLevelOptions}
                    />
                ) : (
                    <>
                        <SelectField
                            label="Composition"
                            value={input.features.composition}
                            onChange={e => handleFeatureChange({ composition: e.target.value as any })}
                            options={isACR ? acrCompositionOptions : (isATA ? ataCompositionOptions : btaCompositionOptions)}
                        />
                        <SelectField
                            label="Echogenicity"
                            value={input.features.echogenicity}
                            onChange={e => handleFeatureChange({ echogenicity: e.target.value as any })}
                            options={isACR ? acrEchogenicityOptions : (isATA ? ataEchogenicityOptions : btaEchogenicityOptions)}
                        />
                        <SelectField
                            label="Margins"
                            value={input.features.margins}
                            onChange={e => handleFeatureChange({ margins: e.target.value as any })}
                            options={isACR ? acrMarginOptions : marginOptions}
                        />
                        <SelectField
                            label="Shape"
                            value={input.features.shape}
                            onChange={e => handleFeatureChange({ shape: e.target.value as any })}
                            options={isACR ? acrShapeOptions : shapeOptions}
                        />
                        <SelectField
                            label="Calcifications / Foci"
                            value={input.features.calcifications}
                            onChange={e => handleFeatureChange({ calcifications: e.target.value as any })}
                            options={isACR ? acrCalcificationOptions : (isATA ? ataCalcificationOptions : btaCalcificationOptions)}
                        />
                        {!isATA && !isACR && (
                            <SelectField
                                label="Vascularity"
                                value={input.features.vascularity}
                                onChange={e => handleFeatureChange({ vascularity: e.target.value as any })}
                                options={btaVascularityOptions}
                            />
                        )}
                    </>
                )}
            </div>
            <div className="grid grid-cols-1 gap-x-4 gap-y-3 pt-2">
                {(!isACR || !input.manual_ti_rads_level) && (
                    <CheckboxField label={isACR ? "Extrathyroidal Extension (+3 pts)" : "Extrathyroidal Extension (ETE)"} checked={input.features.extrathyroidal_extension} onChange={e => handleFeatureChange({ extrathyroidal_extension: e.target.checked })} />
                )}
            </div>
        </div>
    );
};