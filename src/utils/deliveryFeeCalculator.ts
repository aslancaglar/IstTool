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
    const pattern = fee.postalCode.trim();
    
    // Check for range pattern (e.g., "57190-57199")
    const rangeMatch = pattern.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) {
      const [, start, end] = rangeMatch;
      const postalNum = parseInt(cleanPostalCode, 10);
      const startNum = parseInt(start, 10);
      const endNum = parseInt(end, 10);
      
      if (!isNaN(postalNum) && postalNum >= startNum && postalNum <= endNum) {
        return { 
          price: fee.price, 
          zoneName: fee.name, 
          matched: true,
          freeDeliveryThreshold: fee.freeDeliveryThreshold 
        };
      }
      continue;
    }
    
    // Check for wildcard pattern (e.g., "57*")
    if (pattern.includes('*')) {
      const regexPattern = pattern.replace(/\*/g, '.*');
      const regex = new RegExp(`^${regexPattern}$`);
      if (regex.test(cleanPostalCode)) {
        return { 
          price: fee.price, 
          zoneName: fee.name, 
          matched: true,
          freeDeliveryThreshold: fee.freeDeliveryThreshold 
        };
      }
      continue;
    }
    
    // Exact match
    if (pattern === cleanPostalCode) {
      return { 
        price: fee.price, 
        zoneName: fee.name, 
        matched: true,
        freeDeliveryThreshold: fee.freeDeliveryThreshold 
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
