"use client";

import React from 'react';
import { ShoppingBag, CreditCard, Check } from 'lucide-react';

type Step = 'details' | 'payment';

interface CheckoutStepperProps {
    currentStep: Step;
}

export default function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
    const steps = [
        { id: 'details', icon: ShoppingBag, label: 'Ma Commande', number: 1 },
        { id: 'payment', icon: CreditCard, label: 'Paiement', number: 2 }
    ];

    const isCompleted = (stepId: string) => {
        if (stepId === 'details' && currentStep === 'payment') return true;
        return false;
    };

    return (
        <div className="flex justify-center items-center py-4 mb-4">
            <div className="flex items-center gap-4 sm:gap-8 overflow-x-auto no-scrollbar px-4">
                {steps.map((step, idx) => {
                    const active = currentStep === step.id;
                    const completed = isCompleted(step.id);
                    return (
                        <React.Fragment key={step.id}>
                            <div className="flex items-center gap-3 shrink-0">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                                    completed
                                        ? 'bg-primary-600 border-primary-600 shadow-md shadow-primary-500/20 text-white'
                                        : active
                                        ? 'bg-white border-primary-500 shadow-lg shadow-primary-500/20 text-primary-600 scale-105'
                                        : 'bg-white border-gray-200 text-gray-400'
                                }`}>
                                    {completed
                                        ? <Check className="w-5 h-5" strokeWidth={3} />
                                        : <step.icon className="w-4 h-4" strokeWidth={active ? 2.5 : 2} />
                                    }
                                </div>
                                <div className="flex flex-col">
                                    <span className={`text-[10px] font-semibold uppercase tracking-widest leading-none mb-0.5 ${
                                        active ? 'text-primary-600' : completed ? 'text-gray-500' : 'text-gray-400'
                                    }`}>
                                        Étape {step.number}
                                    </span>
                                    <span className={`text-sm font-bold whitespace-nowrap ${
                                        active ? 'text-gray-900' : 'text-gray-500'
                                    }`}>
                                        {step.label}
                                    </span>
                                </div>
                            </div>
                            {idx < steps.length - 1 && (
                                <div className="flex-1 w-12 sm:w-24 h-[2px] bg-gray-200 relative overflow-hidden rounded-full">
                                    <div className={`absolute top-0 left-0 h-full transition-all duration-500 ${
                                        currentStep === 'payment'
                                            ? 'w-full bg-primary-500'
                                            : 'w-0'
                                    }`} />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}
