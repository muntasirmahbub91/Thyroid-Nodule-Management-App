import React, { useState, useCallback, useEffect } from 'react';
import { NoduleHandoffContext } from './types';
import { ModuleSelector } from './components/ModuleSelector';
import { NoduleStepper } from './components/nodule/NoduleStepper';
import { SplashScreen } from './components/SplashScreen';
import { ThyroidCancerManager } from './components/ThyroidCancerManager';
import { AdjuvantTherapyPage } from './components/AdjuvantTherapyPage';
import { GuidelineInfoViewer } from './components/GuidelineInfoViewer';
import { ErrorBoundary } from './components/ErrorBoundary';


const App: React.FC = () => {
    const [isSplashVisible, setIsSplashVisible] = useState(true);
    const [isSplashFading, setIsSplashFading] = useState(false);

    useEffect(() => {
        const fadeTimer = setTimeout(() => {
            setIsSplashFading(true);
        }, 5000); // Start fading after 5 seconds

        const visibilityTimer = setTimeout(() => {
            setIsSplashVisible(false);
        }, 5500); // Remove from DOM after 5.5 seconds (0.5s fade)

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(visibilityTimer);
        };
    }, []);

    const [view, setView] = useState<'selector' | 'nodule' | 'tumor' | 'info' | 'adjuvant'>('selector');
    const [handoffContext, setHandoffContext] = useState<NoduleHandoffContext | null>(null);

    const handleBackToSelector = () => {
        setHandoffContext(null);
        setView('selector');
    }

    const handleProceedToTumorManagement = (context: NoduleHandoffContext) => {
        setHandoffContext(context);
        setView('tumor');
    };

    const renderContent = () => {
        switch (view) {
            case 'selector':
                return (
                    <ModuleSelector
                        onSelectNodule={() => setView('nodule')}
                        onSelectTumor={() => setView('tumor')}
                        onSelectInfo={() => setView('info')}
                    />
                );
            case 'nodule':
                return <NoduleStepper onBack={handleBackToSelector} onProceedToManagement={handleProceedToTumorManagement} />;
            case 'tumor':
                return <ThyroidCancerManager initialContext={handoffContext} onBack={handleBackToSelector} onProceedToAdjuvant={() => setView('adjuvant')} />;
            case 'adjuvant':
                return <AdjuvantTherapyPage onBack={handleBackToSelector} onGoBackToStaging={() => setView('tumor')} />;
            case 'info':
                return <GuidelineInfoViewer onBack={handleBackToSelector} />;
            default:
                return <ModuleSelector onSelectNodule={() => setView('nodule')} onSelectTumor={() => setView('tumor')} onSelectInfo={() => setView('info')} />;
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 text-stone-800">
            {isSplashVisible && <SplashScreen isFading={isSplashFading} />}
            <header className="bg-white border-b border-stone-200 shadow-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-teal-700">Dr Muntasir’s Thyroid Nodule & Cancer Management App</h1>
                        <p className="text-sm text-stone-500">AJCC-8 / NCCN 2025</p>
                    </div>
                </div>
            </header>
            <ErrorBoundary>
                {renderContent()}
            </ErrorBoundary>
        </div>
    );
};

export default App;