interface RestaurantHours {
    day: string;
    time: string;
}

interface Holiday {
    startDate: string;
    endDate: string;
    name?: string;
    active: boolean;
}

interface RestaurantStatus {
    isOpen: boolean;
    nextChange?: string;
    isHoliday?: boolean;
    holidayName?: string;
}

/**
 * Checks if the restaurant is currently open based on working hours and holidays
 * @param hours - Array of restaurant hours from database
 * @param holidays - Array of holidays from database
 * @returns Object with isOpen status and optional nextChange time
 */
export function isRestaurantOpen(
    hours: RestaurantHours[] | undefined,
    holidays: Holiday[] | undefined
): RestaurantStatus {
    if (holidays && holidays.length > 0) {
        const now = new Date();
        // Reset time for date comparison to avoid time-of-day issues
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        for (const holiday of holidays) {
            if (!holiday.active) continue;

            const start = new Date(holiday.startDate).getTime();
            const end = new Date(holiday.endDate).getTime();

            if (today >= start && today <= end) {
                return {
                    isOpen: false,
                    isHoliday: true,
                    holidayName: holiday.name
                };
            }
        }
    }

    if (!hours || hours.length === 0) {
        return { isOpen: false };
    }

    const now = new Date();
    const currentDay = now.toLocaleDateString('fr-FR', { weekday: 'long' });
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes

    // Find today's hours (case-insensitive and trim whitespace)
    const todayHours = hours.find(h =>
        h.day.trim().toLowerCase() === currentDay.toLowerCase()
    );

    if (!todayHours) {
        return { isOpen: false };
    }

    // Parse time ranges (e.g., "11:00-14:00, 18:00-22:00" or "11h00 - 15h00 et 17h00 - 00h00" or "Fermé")
    if (todayHours.time.toLowerCase().includes('fermé') || todayHours.time.toLowerCase().includes('ferme')) {
        return { isOpen: false };
    }

    // Normalize the time string: replace 'h' with ':', handle both 'et' and ',' as separators
    const normalizedTime = todayHours.time.replace(/h/gi, ':');

    // Split by 'et', 'and', or comma for multiple time ranges
    const timeRanges = normalizedTime.split(/\s+et\s+|\s+and\s+|,/).map(t => t.trim());

    for (const range of timeRanges) {
        // Parse start and end times - handle formats like "11:00 - 15:00" or "11:00-15:00"
        const match = range.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);

        if (match) {
            const [, startHour, startMin, endHour, endMin] = match;
            const startTime = parseInt(startHour) * 60 + parseInt(startMin);
            let endTime = parseInt(endHour) * 60 + parseInt(endMin);

            // Handle midnight crossing (e.g., 17:00 - 00:00 means open until midnight)
            if (endTime === 0) {
                endTime = 24 * 60; // Treat 00:00 as end of day
            }

            if (currentTime >= startTime && currentTime <= endTime) {
                return { isOpen: true };
            }
        }
    }

    return { isOpen: false };
}

/**
 * Gets a human-readable status message
 */
export function getStatusMessage(status: RestaurantStatus): string {
    if (status.isHoliday) {
        return status.holidayName ? `Fermé (${status.holidayName})` : 'Fermé (Vacances)';
    }
    return status.isOpen ? 'Ouvert' : 'Fermé';
}
