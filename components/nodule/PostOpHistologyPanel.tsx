
import React from 'react';
import { NoduleCaseInput, PostOpHistology } from '../../types';
import { SelectField, CheckboxField } from '../FormControls';

interface PostOpHistologyPanelProps {
    input: NoduleCaseInput;
    setInput: (update: Partial<NoduleCaseInput>) => void;
}

const finalHistologyOptions = [
    { value: "PTC", label: "Papillary Thyroid Carcinoma" },
    { value: "FTC", label: "Follicular Thyroid Carcinoma" },
    { value: "Oncocytic", label: "Oncocytic (Hürthle Cell) Carcinoma" },
    { value: "NIFTP", label: "NIFTP" },
    { value: "Poorly-differentiated", label: "Poorly Differentiated" },
];

const marginOptions = [
    { value: "negative", label: "Negative (R0)" },
    { value: "close", label: "Close (<1mm, R1-micro)" },
    { value: "positive", label: "Positive (R1-macro)" },
];

const vascularInvasionOptions = [
    { value: "none", label: "None" },
    { value: "1-3", label: "Focal (1-3 vessels)" },
    { value: ">=4", label: "Extensive (≥4 vessels)" },
];

export const PostOpHistologyPanel: React.FC<PostOpHistologyPanelProps> = ({ input, setInput }) => {

    const handlePostOpChange = (update: Partial<PostOpHistology>) => {
        setInput({ post_op_histology: { ...input.post_op_histology, ...update } as PostOpHistology });
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium text-stone-700 border-b pb-2">Step 5: Post-Op Histology (after Lobectomy)</h3>
            <p className="text-sm text-stone-600">Enter the final pathology results from the surgical specimen to determine the next steps.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField 
                    label="Final Histology" 
                    value={input.post_op_histology?.final_histology || ''} 
                    onChange={e => handlePostOpChange({ final_histology: e.target.value as any })} 
                    options={finalHistologyOptions} 
                />
                 <SelectField 
                    label="Margin Status" 
                    value={input.post_op_histology?.margin_status || ''} 
                    onChange={e => handlePostOpChange({ margin_status: e.target.value as any })} 
                    options={marginOptions} 
                />
                 <SelectField 
                    label="Vascular Invasion" 
                    value={input.post_op_histology?.vascular_invasion_vessels || ''} 
                    onChange={e => handlePostOpChange({ vascular_invasion_vessels: e.target.value as any })} 
                    options={vascularInvasionOptions} 
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 pt-2">
                <CheckboxField 
                    label="Gross Extrathyroidal Extension (ETE)" 
                    checked={input.post_op_histology?.gross_ETE || false} 
                    onChange={e => handlePostOpChange({ gross_ETE: e.target.checked })} 
                />
                 <CheckboxField 
                    label="Widely Invasive (for FTC/Oncocytic)" 
                    checked={input.post_op_histology?.widely_invasive || false} 
                    onChange={e => handlePostOpChange({ widely_invasive: e.target.checked })} 
                />
                 <CheckboxField 
                    label="Pathologically Positive Nodes" 
                    checked={input.post_op_histology?.nodes_path_positive || false} 
                    onChange={e => handlePostOpChange({ nodes_path_positive: e.target.checked })} 
                />
            </div>
        </div>
    );
};
