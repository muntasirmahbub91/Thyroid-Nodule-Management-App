import React from 'react';

interface SplashScreenProps {
    isFading: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ isFading }) => {
    return (
        <div
            className={`fixed inset-0 bg-stone-50 z-50 flex flex-col justify-center items-center transition-opacity duration-500 ease-in-out ${
                isFading ? 'opacity-0' : 'opacity-100'
            }`}
            aria-hidden={isFading}
        >
            <div className="text-center">
                <h1 className="text-5xl md:text-6xl font-extrabold text-teal-700 tracking-tighter">
                    Dr Muntasir’s
                </h1>
                <p className="text-lg md:text-xl text-stone-500 mt-3 font-light tracking-wide">
                    Thyroid Nodule & Cancer Management App
                </p>
            </div>
        </div>
    );
};