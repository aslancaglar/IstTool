import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isRestaurantOpen, getStatusMessage } from './isRestaurantOpen';

// Standard week used by the restaurant. Friday/Saturday close after midnight.
const HOURS = [
    { day: 'Lundi', time: '11h00 - 14h00 et 17h00 - 23h00' },
    { day: 'Mardi', time: 'Fermé' },
    { day: 'Mercredi', time: '11h00 - 14h00 et 17h00 - 23h00' },
    { day: 'Jeudi', time: '11h00 - 14h00 et 17h00 - 23h00' },
    { day: 'Vendredi', time: '11h00 - 14h00 et 17h00 - 01h00' },
    { day: 'Samedi', time: '11h00 - 14h00 et 17h00 - 01h00' },
    { day: 'Dimanche', time: '11h00 - 14h00 et 17h00 - 23h00' },
];

// Helper: Paris is UTC+2 in June (CEST). Set the clock to a Paris wall-clock time.
function setParis(iso: string) {
    // iso is the desired Paris time; subtract 2h to express it as UTC.
    const paris = new Date(`${iso}+02:00`);
    vi.setSystemTime(paris);
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('isRestaurantOpen — midnight-spanning hours', () => {
    it('is OPEN on Saturday evening during a 17:00-01:00 service (the reported bug)', () => {
        setParis('2026-06-20T18:34:00'); // Saturday 18:34 Paris
        expect(isRestaurantOpen(HOURS, []).isOpen).toBe(true);
    });

    it('is OPEN just before midnight on Saturday', () => {
        setParis('2026-06-20T23:45:00');
        expect(isRestaurantOpen(HOURS, []).isOpen).toBe(true);
    });

    it('is OPEN after midnight (Sunday 00:30) thanks to Saturday 17:00-01:00 tail', () => {
        setParis('2026-06-21T00:30:00'); // Sunday early morning
        expect(isRestaurantOpen(HOURS, []).isOpen).toBe(true);
    });

    it('is CLOSED after the 01:00 close (Sunday 01:30)', () => {
        setParis('2026-06-21T01:30:00');
        expect(isRestaurantOpen(HOURS, []).isOpen).toBe(false);
    });
});

describe('isRestaurantOpen — normal cases', () => {
    it('is OPEN on Wednesday dinner (17:00-23:00)', () => {
        setParis('2026-06-17T19:00:00'); // Wednesday
        expect(isRestaurantOpen(HOURS, []).isOpen).toBe(true);
    });

    it('is CLOSED between lunch and dinner, opening at 17:00', () => {
        setParis('2026-06-20T15:00:00'); // Saturday 15:00
        const status = isRestaurantOpen(HOURS, []);
        expect(status.isOpen).toBe(false);
        expect(getStatusMessage(status)).toBe('Ouvre à 17:00');
    });

    it('is CLOSED all day on Mardi (Fermé)', () => {
        setParis('2026-06-16T19:00:00'); // Tuesday
        expect(isRestaurantOpen(HOURS, []).isOpen).toBe(false);
    });
});
