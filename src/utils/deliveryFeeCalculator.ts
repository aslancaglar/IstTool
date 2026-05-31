import { matchesPostalCode } from '../../convex/lib/postalCode';

interface DeliveryFee {
  postalCode: string;
  price: number;
  name?: string;
  freeDeliveryThreshold?: number;
}

interface DeliveryFeeResult {
  price: number;
  zoneName?: string;
  matched: boolean;
  freeDeliveryThreshold?: number;
}

/**
 * Calculates delivery fee based on postal code and configured delivery zones
 * Supports exact match, wildcard (57*), and range (57190-57199) patterns
 */
export function calculateDeliveryFee(
  postalCode: string,
  deliveryFees: DeliveryFee[] | undefined,
  defaultFee: number = 0
): DeliveryFeeResult {
  if (!deliveryFees || deliveryFees.length === 0) {
    return { price: defaultFee, matched: false };
  }

  const cleanPostalCode = postalCode.trim();

  for (const fee of deliveryFees) {
    if (matchesPostalCode(fee.postalCode, cleanPostalCode)) {
      return {
        price: fee.price,
        zoneName: fee.name,
        matched: true,
        freeDeliveryThreshold: fee.freeDeliveryThreshold,
      };
    }
  }

  // No match found, return default fee
  return { price: defaultFee, matched: false };
}

/**
 * Formats delivery fee for display
 */
export function formatDeliveryFee(price: number): string {
  if (price === 0) {
    return 'Gratuit';
  }
  return `${price.toFixed(2).replace('.', ',')} €`;
}
