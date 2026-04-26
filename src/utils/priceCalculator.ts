import { MenuItem } from '../types/order';
import { SelectedTopping } from '../types/order';

export function getBasePrice(menuItem: MenuItem): number {
  return menuItem.price;
}

export function calculateToppingsPrice(selectedToppings: SelectedTopping[]): number {
  return selectedToppings.reduce((sum, topping) => sum + (topping.price || 0), 0);
}

export function calculateTotalPrice(
  menuItem: MenuItem,
  selectedToppings: SelectedTopping[]
): number {
  const basePrice = getBasePrice(menuItem);
  const toppingsPrice = calculateToppingsPrice(selectedToppings);
  return basePrice + toppingsPrice;
}
