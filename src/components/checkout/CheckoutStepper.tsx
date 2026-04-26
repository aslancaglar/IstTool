"use client";

import React from 'react';
import { ShoppingBag, CreditCard, ChevronRight } from 'lucide-react';

type Step = 'details' | 'payment';

interface CheckoutStepperProps {
    currentStep: Step;
}

export default function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
    const steps = [
        { id: 'details', icon: ShoppingBag, label: 'Ma Commande' },
        { id: 'payment', icon: CreditCard, label: 'Paiement' }
    ];

    return (
        <div className="flex items-center justify-between bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-8 overflow-x-auto no-scrollbar">
            {steps.map((step, idx) => (
                <React.Fragment key={step.id}>
                    <div className="flex items-center gap-3 shrink-0">
                        <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${currentStep === step.id
                                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/20 scale-110'
                                    : 'bg-gray-50 text-gray-400'
                                }`}
                        >
                            <step.icon className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className={`text-[10px] font-bold uppercase tracking-widest leading-none mb-1 ${currentStep === step.id ? 'text-red-500' : 'text-gray-400'
                                }`}>
                                Étape {idx + 1}
                            </span>
                            <span className={`text-sm font-bold whitespace-nowrap ${currentStep === step.id ? 'text-gray-900' : 'text-gray-400'
                                }`}>
                                {step.label}
                            </span>
                        </div>
                    </div>
                    {idx < steps.length - 1 && (
                        <div className="flex-1 mx-4 min-w-[20px] h-px bg-gray-100" />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}
