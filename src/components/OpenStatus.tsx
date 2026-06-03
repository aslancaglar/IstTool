"use client";
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Clock, X, Calendar } from 'lucide-react';
import { isRestaurantOpen, getStatusMessage, formatOpensIn, type RestaurantStatus } from '../utils/isRestaurantOpen';

interface OpenStatusProps {
    isScrolled?: boolean;
    variant?: 'desktop' | 'mobile';
}

// Show an "Ouvre dans …" countdown instead of "Fermé" when opening within this window.
const OPENING_SOON_MINUTES = 30;

export default function OpenStatus({ variant = 'desktop' }: OpenStatusProps) {
    const restaurantInfo = useQuery(api.restaurantInfo.get);
    const [currentStatus, setCurrentStatus] = useState<RestaurantStatus>({ isOpen: false });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Update status every minute
    useEffect(() => {
        setIsMounted(true);
        const updateStatus = () => {
            if (restaurantInfo) {
                const status = isRestaurantOpen(restaurantInfo.hours, restaurantInfo.holidays);
                setCurrentStatus(status);
            }
        };

        updateStatus();
        const interval = setInterval(updateStatus, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [restaurantInfo]);

    if (!restaurantInfo) {
        return null;
    }

    const statusMessage = getStatusMessage(currentStatus);
    const openingSoon =
        !currentStatus.isOpen &&
        currentStatus.minutesUntilOpen != null &&
        currentStatus.minutesUntilOpen <= OPENING_SOON_MINUTES;
    const label = openingSoon ? formatOpensIn(currentStatus.minutesUntilOpen!) : statusMessage;
    const clockColor = currentStatus.isOpen
        ? 'text-green-400'
        : openingSoon
            ? 'text-amber-400'
            : 'text-red-400';

    const Modal = () => {
        if (!isMounted) return null;
        return createPortal(
            <>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-in fade-in duration-200">
                        <div
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <div
                            className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200"
                        >
                            <div className="flex items-center justify-between p-5 border-b border-gray-100">
                                <h3 className="text-xl font-display font-bold text-gray-900 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-primary-600" />
                                    Horaires d'ouverture
                                </h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 -mr-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-5">
                                <div className="space-y-3">
                                    {restaurantInfo.hours?.map((schedule, i) => (
                                        <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0 last:pb-0">
                                            <span className="font-medium text-gray-700 capitalize">
                                                {schedule.day}
                                            </span>
                                            <span className="text-gray-600 font-mono text-sm">
                                                {schedule.time || "Fermé"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </>,
            document.body
        );
    };

    // Mobile variant (for mobile header & menu)
    if (variant === 'mobile') {
        return (
            <>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-1.5 bg-black/20 hover:bg-black/30 transition-colors rounded-full backdrop-blur-md border border-white/20 shadow-sm active:scale-95"
                >
                    <Clock className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${clockColor}`} />
                    <span className="text-white font-bold uppercase tracking-wider text-[10px] sm:text-xs">
                        {label}
                    </span>
                </button>
                <Modal />
            </>
        );
    }

    // Desktop variant
    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/10 hover:bg-black/20 transition-all active:scale-95"
            >
                <Clock className={`w-3.5 h-3.5 ${clockColor}`} />
                <span className="text-white font-black uppercase tracking-widest text-[10px]">
                    {label}
                </span>
            </button>
            <Modal />
        </>
    );
}
