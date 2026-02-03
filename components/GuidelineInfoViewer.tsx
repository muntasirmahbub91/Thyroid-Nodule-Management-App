
import React, { useState } from 'react';
import { GUIDELINE_INFO_DATA } from '../constants/guidelineInfoData';

interface GuidelineInfoViewerProps {
    onBack: () => void;
}

type TabKey = keyof typeof GUIDELINE_INFO_DATA;

const guidelineTabs: { key: TabKey, label: string }[] = [
    { key: 'usg', label: 'USG Risk' },
    { key: 'cytology', label: 'Cytology' },
    { key: 'staging', label: 'Staging' },
    { key: 'initialTreatment', label: 'Initial Treatment' },
    { key: 'adjuvant', label: 'Adjuvant Therapy' },
];

export const GuidelineInfoViewer: React.FC<GuidelineInfoViewerProps> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<TabKey>('usg');
    const activeData = GUIDELINE_INFO_DATA[activeTab];

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadJSON = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(GUIDELINE_INFO_DATA, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "thyroid_guidelines_rules.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const renderTabContent = () => {
        return (
            <div className="printable">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-stone-800 mb-2">{activeData.title}</h2>
                        <p className="text-stone-600 mb-8 max-w-2xl">{activeData.description}</p>
                    </div>
                    <div className="flex space-x-2 no-print">
                        <button
                            onClick={handlePrint}
                            className="bg-white border border-stone-300 text-stone-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-stone-50 flex items-center shadow-sm transition-all"
                        >
                            <span className="mr-2">🖨️</span> Save as PDF
                        </button>
                        <button
                            onClick={handleDownloadJSON}
                            className="bg-stone-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-black flex items-center shadow-sm transition-all"
                        >
                            <span className="mr-2">⬇️</span> Rules (JSON)
                        </button>
                    </div>
                </div>

                {activeData.guidelines.map(guideline => (
                    <div key={guideline.name} className="mb-10 page-break-after">
                        <h3 className="text-xl font-bold text-teal-700 mb-4 pb-2 border-b-2 border-teal-100 uppercase tracking-wide">{guideline.name}</h3>
                        <div className="grid grid-cols-1 gap-4">
                            {guideline.rules.map(rule => (
                                <div key={rule.name} className="bg-white p-5 rounded-xl shadow-sm border border-stone-200 hover:border-teal-200 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="font-bold text-stone-800 text-lg">{rule.name}</p>
                                        {rule.risk && (
                                            <span className="text-xs font-bold px-2 py-1 bg-indigo-100 text-indigo-700 rounded uppercase tracking-tighter">
                                                {rule.risk}
                                            </span>
                                        )}
                                    </div>

                                    {rule.threshold && (
                                        <p className="text-sm font-bold text-indigo-600 mb-2">
                                            Threshold: {rule.threshold}
                                        </p>
                                    )}
                                    <p className="text-sm text-stone-600 italic leading-relaxed">{rule.recommendation || rule.rationale}</p>

                                    {rule.criteria && rule.criteria.length > 0 && (
                                        <div className="mt-4 bg-stone-50 p-3 rounded-lg border border-stone-100">
                                            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Diagnostic Criteria</p>
                                            <ul className="list-disc list-inside text-sm text-stone-600 space-y-1">
                                                {rule.criteria.map((c, i) => <li key={i}>{c}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    .no-print { display: none !important; }
                    .printable { display: block !important; }
                    body { background: white !important; }
                    main { padding: 0 !important; max-width: 100% !important; }
                    .page-break-after { page-break-after: always; }
                }
            ` }} />

            <div className="mb-6 no-print">
                <button onClick={onBack} className="text-sm text-teal-600 hover:text-teal-800 font-medium flex items-center transition-colors">
                    <span className="mr-1">‹</span> Back to Module Selector
                </button>
            </div>

            <div className="text-center mb-10 no-print">
                <h1 className="text-3xl font-bold text-stone-800">Clinical Guidelines & Logic Exports</h1>
                <p className="text-lg text-stone-600 mt-2">Access and download the clinical intelligence powering this platform.</p>
            </div>

            <div className="flex justify-center border-b border-stone-200 mb-8 no-print overflow-x-auto whitespace-nowrap scrollbar-hide">
                {guidelineTabs.map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`px-4 sm:px-6 py-4 font-bold text-sm transition-all relative ${activeTab === key ? 'text-teal-600' : 'text-stone-500 hover:text-stone-700'}`}
                    >
                        {label}
                        {activeTab === key && <div className="absolute bottom-0 left-0 right-0 h-1 bg-teal-500 rounded-t-lg" />}
                    </button>
                ))}
            </div>

            {renderTabContent()}

            <div className="mt-20 pt-10 border-t border-stone-200 text-center no-print">
                <p className="text-stone-400 text-xs font-medium uppercase tracking-widest mb-4">Complete Guideline System</p>
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={handleDownloadJSON}
                        className="bg-stone-100 text-stone-600 px-6 py-3 rounded-xl text-sm font-bold hover:bg-stone-200 transition-all border border-stone-200"
                    >
                        Download Full Framework (JSON)
                    </button>
                </div>
                <p className="text-stone-500 text-sm mt-6 italic">This system integrates ATA 2015, BTA 2014, ACR TI-RADS 2017, and AJCC 8th Edition rules.</p>
            </div>
        </main>
    );
};