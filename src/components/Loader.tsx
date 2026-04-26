import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Loader({ onFinished }: { onFinished: () => void }) {
    const [progress, setProgress] = useState(0);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Animate progress bar
        const timer = setTimeout(() => setProgress(30), 200);
        const timer2 = setTimeout(() => setProgress(60), 600);
        const timer3 = setTimeout(() => setProgress(90), 1000);
        const timer4 = setTimeout(() => setProgress(100), 1400);
        const timer5 = setTimeout(() => setFadeOut(true), 1700);
        const timer6 = setTimeout(() => onFinished(), 2200);

        return () => {
            clearTimeout(timer);
            clearTimeout(timer2);
            clearTimeout(timer3);
            clearTimeout(timer4);
            clearTimeout(timer5);
            clearTimeout(timer6);
        };
    }, [onFinished]);

    return (
        <div
            className={`loader-overlay ${fadeOut ? 'loader-fade-out' : ''}`}
        >
            {/* Background Pattern */}
            <div className="loader-bg-pattern" />

            {/* Content */}
            <div className="loader-content">
                {/* Logo */}
                <div className={`loader-logo ${progress > 0 ? 'loader-logo-visible' : ''}`}>
                    <div className="relative w-32 md:w-40 h-32 md:h-40 mb-8 animate-pulse">
                        <Image
                            src="/LogoMondo.png"
                            alt="Mondo Pizza"
                            fill
                            priority
                            className="object-contain"
                        />
                    </div>
                </div>

                {/* Tagline */}
                <p className={`loader-tagline ${progress > 30 ? 'loader-tagline-visible' : ''}`}>
                    Le vrai goût de la pizza artisanale
                </p>

                {/* Progress Bar */}
                <div className="loader-progress-track">
                    <div
                        className="loader-progress-bar"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Loading Text */}
                <span className={`loader-text ${progress > 0 ? 'loader-text-visible' : ''}`}>
                    {progress < 100 ? 'Chargement...' : 'Bienvenue !'}
                </span>
            </div>
        </div>
    );
}
