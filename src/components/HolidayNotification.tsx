"use client";
import { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { X, Calendar } from 'lucide-react';

export default function HolidayNotification() {
    const restaurantInfo = useQuery(api.restaurantInfo.get);
    const [activeHoliday, setActiveHoliday] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (restaurantInfo?.holidays) {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

            const currentHoliday = restaurantInfo.holidays.find(h => {
                if (!h.active) return false;
                const start = new Date(h.startDate).getTime();
                const end = new Date(h.endDate).getTime();
                return today >= start && today <= end;
            });

            if (currentHoliday) {
                // Check if we've already shown this holiday recently (session-based)
                const dismissedHoliday = sessionStorage.getItem(`holiday_dismissed_${currentHoliday.startDate}`);
                if (!dismissedHoliday) {
                    setActiveHoliday(currentHoliday);
                    setIsVisible(true);
                }
            }
        }
    }, [restaurantInfo]);

    const handleClose = () => {
        if (activeHoliday) {
            sessionStorage.setItem(`holiday_dismissed_${activeHoliday.startDate}`, 'true');
        }
        setIsVisible(false);
    };

    if (!isVisible || !activeHoliday) return null;

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden transform transition-all animate-scale-in">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Banner/Header */}
                <div className="bg-red-500 p-8 flex flex-col items-center text-center">
                    <div className="bg-white/20 p-4 rounded-full mb-4">
                        <Calendar className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-2xl font-titan font-normal text-white uppercase tracking-wider">
                        Information Importante
                    </h2>
                </div>

                {/* Content */}
                <div className="p-8 text-center">
                    <h3 className="text-xl font-normal text-slate-900 mb-4 font-titan">
                        {activeHoliday.name || 'Fermeture Exceptionnelle'}
                    </h3>

                    <p className="text-slate-600 mb-6 text-lg leading-relaxed">
                        Chers clients, nous vous informons que le restaurant sera fermé du :
                    </p>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8">
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Période</span>
                            <span className="text-xl font-bold text-red-500">
                                {formatDate(activeHoliday.startDate)}
                            </span>
                            <span className="text-slate-400 font-bold">au</span>
                            <span className="text-xl font-bold text-red-500">
                                {formatDate(activeHoliday.endDate)}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleClose}
                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0 uppercase tracking-wide"
                    >
                        Continuer vers le site
                    </button>

                    <p className="mt-4 text-sm text-slate-400 font-medium italic">
                        Merci de votre compréhension.
                    </p>
                </div>
            </div>
        </div>
    );
}
