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

export interface RestaurantStatus {
    isOpen: boolean;
    /** When closed: minutes until the next opening (if one is found within 7 days). */
    minutesUntilOpen?: number;
    isHoliday?: boolean;
    holidayName?: string;
}

const MINUTES_PER_DAY = 24 * 60;

/** French weekday name (lowercase) for a given date, matching the `hours` array's `day`. */
function dayKey(date: Date): string {
    return date.toLocaleDateString('fr-FR', { weekday: 'long' }).toLowerCase();
}

function findDayHours(hours: RestaurantHours[], date: Date): RestaurantHours | undefined {
    const key = dayKey(date);
    return hours.find(h => h.day.trim().toLowerCase() === key);
}

/**
 * Parse a day's time string into [start, end] ranges in minutes-from-midnight.
 * Handles "11h00 - 15h00 et 17h00 - 00h00", "11:00-14:00, 18:00-22:00", "Fermé".
 * A trailing "00:00" end is treated as midnight (end of day).
 */
function parseTimeRanges(time: string | undefined): { start: number; end: number }[] {
    if (!time) return [];
    const lower = time.toLowerCase();
    if (lower.includes('fermé') || lower.includes('ferme')) return [];

    const normalized = time.replace(/h/gi, ':');
    const parts = normalized.split(/\s+et\s+|\s+and\s+|,/);

    const ranges: { start: number; end: number }[] = [];
    for (const part of parts) {
        const match = part.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
        if (match) {
            const [, sh, sm, eh, em] = match;
            const start = parseInt(sh) * 60 + parseInt(sm);
            let end = parseInt(eh) * 60 + parseInt(em);
            if (end === 0) end = MINUTES_PER_DAY; // 00:00 = end of day
            ranges.push({ start, end });
        }
    }
    return ranges.sort((a, b) => a.start - b.start);
}

/** Active holiday covering the given calendar day, if any. */
function activeHolidayOn(date: Date, holidays: Holiday[] | undefined): Holiday | undefined {
    if (!holidays || holidays.length === 0) return undefined;
    const day = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    for (const holiday of holidays) {
        if (!holiday.active) continue;
        const start = new Date(holiday.startDate).getTime();
        const end = new Date(holiday.endDate).getTime();
        if (day >= start && day <= end) return holiday;
    }
    return undefined;
}

/**
 * Minutes from now until the next opening, scanning today's remaining ranges and
 * the next 7 days. Skips holidays and "Fermé" days. Returns undefined if none found.
 */
function computeMinutesUntilOpen(
    hours: RestaurantHours[],
    holidays: Holiday[] | undefined,
    now: Date,
): number | undefined {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (let dayOffset = 0; dayOffset <= 7; dayOffset++) {
        const date = new Date(now);
        date.setDate(now.getDate() + dayOffset);

        if (activeHolidayOn(date, holidays)) continue;

        const ranges = parseTimeRanges(findDayHours(hours, date)?.time);
        for (const range of ranges) {
            const delta = dayOffset * MINUTES_PER_DAY + range.start - currentMinutes;
            if (delta > 0) return delta; // first positive is the soonest (days & ranges ascending)
        }
    }
    return undefined;
}

/**
 * Checks if the restaurant is currently open based on working hours and holidays.
 * When closed, also reports how many minutes remain until the next opening.
 */
export function isRestaurantOpen(
    hours: RestaurantHours[] | undefined,
    holidays: Holiday[] | undefined
): RestaurantStatus {
    const now = new Date();
    const todayHoliday = activeHolidayOn(now, holidays);

    if (!hours || hours.length === 0) {
        return { isOpen: false, isHoliday: !!todayHoliday, holidayName: todayHoliday?.name };
    }

    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Currently open? (Never open during an active holiday.)
    if (!todayHoliday) {
        const todayRanges = parseTimeRanges(findDayHours(hours, now)?.time);
        for (const range of todayRanges) {
            if (currentMinutes >= range.start && currentMinutes <= range.end) {
                return { isOpen: true };
            }
        }
    }

    const minutesUntilOpen = computeMinutesUntilOpen(hours, holidays, now);

    return {
        isOpen: false,
        minutesUntilOpen,
        isHoliday: !!todayHoliday,
        holidayName: todayHoliday?.name,
    };
}

/**
 * Gets a human-readable status message.
 */
export function getStatusMessage(status: RestaurantStatus): string {
    if (status.isHoliday) {
        return status.holidayName ? `Fermé (${status.holidayName})` : 'Fermé (Vacances)';
    }
    return status.isOpen ? 'Ouvert' : 'Fermé';
}

/** "Ouvre dans 30 min" / "Ouvre dans 1h" / "Ouvre dans 1h30". */
export function formatOpensIn(minutes: number): string {
    if (minutes < 60) return `Ouvre dans ${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m === 0 ? `Ouvre dans ${h}h` : `Ouvre dans ${h}h${String(m).padStart(2, '0')}`;
}
