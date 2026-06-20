import { describe, expect, it } from 'vitest';
import { buildOrderReceipt, type OrderForReceipt } from './escpos';

const BOLD_ON = '\x1B\x45\x01';
const BOLD_OFF = '\x1B\x45\x00';
const DBLSTRIKE_ON = '\x1B\x47\x01';
const DBLSTRIKE_OFF = '\x1B\x47\x00';

function decode(base64: string): string {
    return atob(base64);
}

const baseOrder: OrderForReceipt = {
    _id: 'abc123def890zsb',
    customer: { firstName: 'Fabrice', lastName: 'Grosdidier', phone: '+33650688792' },
    type: 'pickup',
    scheduledTime: 'asap',
    paymentMethod: 'cash',
    paymentStatus: 'unpaid',
    items: [
        { name: 'Tacos XL', finalPrice: 17.5, price: 17.5, tvaPercent: 10 },
    ],
    totalPrice: 17.5,
    createdAt: Date.now(),
};

describe('buildOrderReceipt', () => {
    it('wraps the article name in emphasis + double-strike control codes', () => {
        const raw = decode(buildOrderReceipt(baseOrder, null));
        // emphasis and double-strike both enabled right before the name
        expect(raw).toContain(`${BOLD_ON}${DBLSTRIKE_ON}1x Tacos XL`);
        // both turned off again before the modifiers/next line
        const idx = raw.indexOf('1x Tacos XL');
        expect(raw.slice(idx)).toContain(DBLSTRIKE_OFF);
        expect(raw.slice(idx)).toContain(BOLD_OFF);
    });

    // Accented chars are CP858-encoded in the byte stream, so assert on the
    // accent-free portions of each label.
    it('prints NON PAYE (Especes) for an unpaid cash order', () => {
        const raw = decode(buildOrderReceipt(baseOrder, null));
        expect(raw).toContain('PAIEMENT:');
        expect(raw).toContain('NON PAY'); // "NON PAYÉ"
        expect(raw).toContain('(Esp');    // "(Espèces)"
    });

    it('prints PAYE (Carte) for a paid card order', () => {
        const raw = decode(buildOrderReceipt(
            { ...baseOrder, paymentMethod: 'stripe', paymentStatus: 'paid' },
            null,
        ));
        expect(raw).toContain('(Carte)');
    });

    it('prints ECHEC PAIEMENT for a failed payment', () => {
        const raw = decode(buildOrderReceipt(
            { ...baseOrder, paymentMethod: 'stripe', paymentStatus: 'failed' },
            null,
        ));
        expect(raw).toContain('CHEC PAIEMENT'); // "ÉCHEC PAIEMENT"
    });
});
