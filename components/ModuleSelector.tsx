import React from 'react';
import { ThyroidIcon, UltrasoundIcon } from './Icons';

interface ModuleSelectorProps {
    onSelectNodule: () => void;
    onSelectTumor: () => void;
    onSelectInfo: () => void;
}

export const ModuleSelector: React.FC<ModuleSelectorProps> = ({ onSelectNodule, onSelectTumor, onSelectInfo }) => {
    return (
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-2xl mx-auto text-center py-12">
                <h2 className="text-3xl font-bold text-stone-800 mb-4">Select a Workflow</h2>
                <p className="text-lg text-stone-600 mb-8">Choose a module to begin evaluation and planning.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button
                        onClick={onSelectNodule}
                        className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl border border-stone-200 transition-all duration-300 transform hover:-translate-y-1 text-left"
                    >
                        <div className="flex items-center mb-4">
                            <UltrasoundIcon style={{ color: '#6C63FF' }} className="h-8 w-8 mr-4 flex-shrink-0" />
                            <h3 className="text-xl font-semibold text-stone-800 group-hover:text-indigo-700">Thyroid Nodule Evaluation</h3>
                        </div>
                        <p className="text-stone-500 mt-2">Guideline-based workup for thyroid nodules, from US features to biopsy decisions.</p>
                    </button>
                    <button
                        onClick={onSelectTumor}
                        className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl border border-stone-200 transition-all duration-300 transform hover:-translate-y-1 text-left"
                    >
                        <div className="flex items-center mb-4">
                            <ThyroidIcon style={{ color: '#2E8B8B' }} className="h-8 w-8 mr-4 flex-shrink-0" />
                            <h3 className="text-xl font-semibold text-stone-800 group-hover:text-teal-700">Thyroid Cancer Management</h3>
                        </div>
                        <p className="text-stone-500 mt-2">Staging, initial treatment, and adjuvant therapy planning for confirmed malignancy.</p>
                    </button>
                </div>
                <div className="mt-12">
                    <button
                        onClick={onSelectInfo}
                        className="bg-white py-2 px-6 rounded-lg shadow-md border border-stone-200 text-teal-700 font-semibold hover:bg-stone-100 hover:border-stone-300 transition-all"
                    >
                        View Clinical Guidelines & Rules
                    </button>
                </div>
            </div>
        </main>
    );
};