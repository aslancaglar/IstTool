// Hand-rolled ESC/POS receipt builder for 80mm thermal printers.
// Returns base64 raw bytes ready to ship as PrintNode `raw_base64` content.

const ESC = 0x1B;
const GS = 0x1D;
const LF = 0x0A;
const WIDTH = 48; // 80mm thermal printer – 48 cols (Font A, 12×24)

// CP858 (default on most modern thermal printers, includes €).
// Mapping for the French diacritics this app actually emits.
const CP858: Record<string, number> = {
  'é': 0x82, 'É': 0x90, 'è': 0x8A, 'È': 0xD4, 'ê': 0x88, 'Ê': 0xD2,
  'ë': 0x89, 'Ë': 0xD3, 'à': 0x85, 'À': 0xB7, 'â': 0x83, 'Â': 0xB6,
  'ä': 0x84, 'Ä': 0x8E, 'ç': 0x87, 'Ç': 0x80, 'ù': 0x97, 'Ù': 0xEB,
  'û': 0x96, 'Û': 0xEA, 'ü': 0x81, 'Ü': 0x9A, 'ô': 0x93, 'Ô': 0xE2,
  'ö': 0x94, 'Ö': 0x99, 'î': 0x8C, 'Î': 0xD7, 'ï': 0x8B, 'Ï': 0xD8,
  '€': 0xD5, '£': 0x9C, '°': 0xF8, '«': 0xAE, '»': 0xAF,
};

function encodeText(text: string): number[] {
  const out: number[] = [];
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (code < 0x80) {
      out.push(code);
      continue;
    }
    if (CP858[ch] != null) {
      out.push(CP858[ch]);
      continue;
    }
    // Unknown char: strip diacritics, fall back to ASCII or '?'
    const stripped = ch.normalize('NFD').replace(/[̀-ͯ]/g, '');
    for (const c2 of stripped) {
      const code2 = c2.charCodeAt(0);
      out.push(code2 < 0x80 ? code2 : 0x3F);
    }
  }
  return out;
}

function pad(left: string, right: string): string {
  const total = left.length + right.length;
  if (total >= WIDTH) return left + ' ' + right;
  return left + ' '.repeat(WIDTH - total) + right;
}

function padCol(text: string, width: number, align: 'left' | 'right' = 'left'): string {
  if (text.length >= width) {
    return align === 'left' ? text.slice(0, width) : text.slice(-width);
  }
  const space = ' '.repeat(width - text.length);
  return align === 'left' ? text + space : space + text;
}

function fmtEur(n: number): string {
  return `${n.toFixed(2)}€`;
}

function bytesToBase64(bytes: number[]): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

export interface EnrichedTopping {
  toppingNames?: string[];
  toppingPrices?: number[];
  toppingTvaPercents?: number[];
}

export interface EnrichedItem {
  menuItemId?: string;
  name: string;
  price?: number;
  finalPrice: number;
  isFree?: boolean;
  selectedToppings?: EnrichedTopping[];
  tvaPercent?: number;
}

export interface OrderForReceipt {
  _id: string;
  customer: { firstName: string; lastName: string; phone: string };
  type: 'pickup' | 'delivery' | 'dine_in';
  address?: { street: string; city: string; zipCode: string; instructions?: string };
  scheduledTime: string;
  paymentMethod: 'stripe' | 'cash';
  paymentStatus: 'unpaid' | 'paid' | 'failed';
  items: EnrichedItem[];
  totalPrice: number;
  deliveryFee?: number;
  promoCode?: string;
  discountAmount?: number;
  createdAt: number;
}

export interface RestaurantForReceipt {
  address?: string;
  phone?: string;
}

export function buildOrderReceipt(
  order: OrderForReceipt,
  info: RestaurantForReceipt | null,
): string {
  const out: number[] = [];
  const push = (...bs: number[]) => out.push(...bs);
  const text = (s: string) => out.push(...encodeText(s));
  const line = (s: string = '') => { text(s); out.push(LF); };
  const dashLine = () => line('-'.repeat(WIDTH));
  const dblLine = () => line('='.repeat(WIDTH));

  // Init + select CP858
  push(ESC, 0x40);
  push(ESC, 0x74, 0x13);

  // Header — centered, double size
  push(ESC, 0x61, 0x01);
  push(GS, 0x21, 0x11);
  line('RESTO ISTANBUL');
  push(GS, 0x21, 0x00);
  if (info?.address) line(info.address);
  if (info?.phone) line(info.phone);
  push(ESC, 0x61, 0x00);
  line();

  // Order block
  dblLine();
  push(ESC, 0x45, 0x01);
  line(`COMMANDE #${order._id.slice(-6).toUpperCase()}`);
  push(ESC, 0x45, 0x00);
  const created = new Date(order.createdAt).toLocaleString('fr-FR', {
    dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Paris',
  });
  line(`Date:  ${created}`);
  line(`Type:  ${order.type === 'dine_in' ? 'SUR PLACE' : order.type === 'pickup' ? 'À EMPORTER' : 'LIVRAISON'}`);
  const sched = !order.scheduledTime || order.scheduledTime === 'asap'
    ? 'Dès que possible'
    : new Date(order.scheduledTime).toLocaleTimeString('fr-FR', {
        hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris',
      });
  line(`Prévu: ${sched}`);
  line();

  // Customer
  line(`Client: ${order.customer.firstName} ${order.customer.lastName}`);
  line(`Tél:    ${order.customer.phone}`);
  if (order.type === 'delivery' && order.address) {
    line();
    push(ESC, 0x45, 0x01);
    line('ADRESSE DE LIVRAISON:');
    push(ESC, 0x45, 0x00);
    line(order.address.street);
    line(`${order.address.zipCode} ${order.address.city}`);
    if (order.address.instructions) line(`Note: ${order.address.instructions}`);
  }
  line();

  // Items
  dashLine();
  push(ESC, 0x45, 0x01);
  line('ARTICLES');
  push(ESC, 0x45, 0x00);
  dashLine();

  for (const item of order.items) {
    const priceStr = item.isFree ? 'OFFERT' : fmtEur(item.finalPrice);
    line(pad(`1x ${item.name}`, priceStr));
    for (const group of item.selectedToppings ?? []) {
      const names = group.toppingNames ?? [];
      const prices = group.toppingPrices ?? [];
      for (let i = 0; i < names.length; i++) {
        const p = prices[i] ?? 0;
        const left = `   + ${names[i]}`;
        const right = p > 0 ? `+${fmtEur(p)}` : '';
        line(pad(left, right));
      }
    }
  }

  dashLine();

  // Totals
  const subtotal = order.items.reduce((s, i) => s + (i.finalPrice ?? 0), 0);
  line(pad('Sous-total:', fmtEur(subtotal)));
  if (order.deliveryFee && order.deliveryFee > 0) {
    line(pad('Livraison:', fmtEur(order.deliveryFee)));
  }
  if (order.discountAmount && order.discountAmount > 0) {
    const tag = order.promoCode ? `Promo (${order.promoCode}):` : 'Promo:';
    line(pad(tag, `-${fmtEur(order.discountAmount)}`));
  }
  dashLine();
  push(GS, 0x21, 0x01); // double height
  push(ESC, 0x45, 0x01);
  line(pad('TOTAL:', fmtEur(order.totalPrice)));
  push(ESC, 0x45, 0x00);
  push(GS, 0x21, 0x00);
  line();



  // TVA Breakdown
  const DEFAULT_TVA = 10;
  const tvaBuckets: Record<number, number> = {};
  for (const item of order.items) {
    const rate = item.tvaPercent ?? DEFAULT_TVA;
    const basePrice = item.isFree ? 0 : (item.price ?? item.finalPrice);
    tvaBuckets[rate] = (tvaBuckets[rate] || 0) + basePrice;

    for (const group of item.selectedToppings ?? []) {
      const prices = group.toppingPrices ?? [];
      const rates = group.toppingTvaPercents ?? [];
      for (let i = 0; i < prices.length; i++) {
        const pPrice = prices[i] ?? 0;
        const pRate = rates[i] ?? rate;
        tvaBuckets[pRate] = (tvaBuckets[pRate] || 0) + pPrice;
      }
    }
  }

  const rates = Object.keys(tvaBuckets).map(Number).sort((a, b) => a - b);
  if (rates.length > 0) {
    dashLine();
    line('DÉTAIL TVA (TTC inclus)');
    line(
      padCol('Taux', 8, 'left') +
      padCol('HT', 13, 'right') +
      padCol('TVA', 13, 'right') +
      padCol('TTC', 14, 'right')
    );
    let totalHT = 0;
    let totalTVA = 0;
    for (const rate of rates) {
      const ttc = tvaBuckets[rate];
      const ht = ttc / (1 + rate / 100);
      const tva = ttc - ht;
      totalHT += ht;
      totalTVA += tva;
      line(
        padCol(`${rate}%`, 8, 'left') +
        padCol(fmtEur(ht), 13, 'right') +
        padCol(fmtEur(tva), 13, 'right') +
        padCol(fmtEur(ttc), 14, 'right')
      );
    }
    dashLine();
    line(pad(`Total HT: ${fmtEur(totalHT)}`, `Total TVA: ${fmtEur(totalTVA)}`));
    line();
  }

  // Footer
  push(ESC, 0x61, 0x01);
  dblLine();
  line('Merci de votre commande !');
  dblLine();
  push(ESC, 0x61, 0x00);

  // Feed + partial cut
  push(ESC, 0x64, 0x04);
  push(GS, 0x56, 0x01);

  return bytesToBase64(out);
}
