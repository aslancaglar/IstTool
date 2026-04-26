

export function formatPrice(price: number): string {
  return `${price.toFixed(2)}€`;
}

export function formatPhoneNumber(phone: string): string {
  return phone.replace(/(\d{2})(?=\d)/g, '$1 ');
}
