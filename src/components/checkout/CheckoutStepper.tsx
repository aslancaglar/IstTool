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
        <div className="flex items-center bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-white overflow-x-auto no-scrollbar">
            {steps.map((step, idx) => {
                const active = currentStep === step.id;
                const completed = isCompleted(step.id);
                return (
                    <React.Fragment key={step.id}>
                        <div className="flex items-center gap-3 shrink-0">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                completed
                                    ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25'
                                    : active
                                    ? 'bg-gradient-to-br from-orange-400 to-rose-500 shadow-lg shadow-orange-500/25 scale-110'
                                    : 'bg-gray-100'
                            }`}>
                                {completed
                                    ? <Check className="w-5 h-5 text-white" strokeWidth={3} />
                                    : <step.icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-400'}`} />
                                }
                            </div>
                            <div className="flex flex-col">
                                <span className={`text-[10px] font-bold uppercase tracking-widest leading-none mb-0.5 ${
                                    active ? 'text-orange-500' : completed ? 'text-emerald-500' : 'text-gray-400'
                                }`}>
                                    Étape {step.number}
                                </span>
                                <span className={`text-sm font-bold whitespace-nowrap ${
                                    active ? 'text-gray-900' : 'text-gray-400'
                                }`}>
                                    {step.label}
                                </span>
                            </div>
                        </div>
                        {idx < steps.length - 1 && (
                            <div className="flex-1 mx-4 min-w-[20px] h-1 rounded-full overflow-hidden bg-gray-100">
                                <div className={`h-full rounded-full transition-all duration-500 ${
                                    currentStep === 'payment'
                                        ? 'w-full bg-gradient-to-r from-emerald-400 to-teal-400'
                                        : 'w-0'
                                }`} />
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}
