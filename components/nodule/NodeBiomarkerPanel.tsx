
import React from 'react';
import { NoduleCaseInput } from '../../types';
import { CheckboxField } from '../FormControls';

interface NodeBiomarkerPanelProps {
    input: NoduleCaseInput;
    setInput: (update: Partial<NoduleCaseInput>) => void;
}

export const NodeBiomarkerPanel: React.FC<NodeBiomarkerPanelProps> = ({ input, setInput }) => {
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium text-stone-700 border-b pb-2">Step 3: Suspicious Nodes & Biomarkers</h3>
            <div className="space-y-4">
                <CheckboxField 
                    label="Suspicious Cervical Lymph Node on Ultrasound" 
                    checked={input.node_suspicious}
                    onChange={(e) => setInput({ node_suspicious: e.target.checked })}
                />
                <CheckboxField 
                    label="Elevated Serum Calcitonin (>100 pg/mL)" 
                    checked={input.calcitonin_elevated}
                    onChange={(e) => setInput({ calcitonin_elevated: e.target.checked })}
                />
                <div className="p-3 bg-sky-50 border-l-4 border-sky-400 text-sm text-sky-800">
                    <p><strong>Note:</strong> A suspicious node or highly elevated calcitonin are strong indicators for biopsy, often overriding nodule size criteria.</p>
                </div>
            </div>
        </div>
    );
};
