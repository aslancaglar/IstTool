"use client";
import { useState, useEffect, useMemo, useCallback } from 'react';
import { X } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { SelectedTopping, OrderItem } from '../types/order';
import { useOrder } from '../context/OrderContext';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { getBasePrice, calculateTotalPrice } from '../utils/priceCalculator';
import { formatPrice } from '../utils/formatters';
import ToppingCategory from './ToppingCategory';

interface MenuItemModalProps {
  item: {
    _id: Id<"menuItems">;
    _creationTime: number;
    name: string;
    description: string;
    price: number;
    image: string;
    categories?: string[];
    popular?: boolean;
    tvaPercent?: number;
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function MenuItemModal({ item, isOpen, onClose }: MenuItemModalProps) {
  const { addToOrder } = useOrder();
  const [selectedToppings, setSelectedToppings] = useState<Record<string, SelectedTopping[]>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const availableCategories = useQuery(
    api.queries.getToppingsForMenuItem,
    item?._id ? { menuItemId: item._id } : "skip"
  );

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      setSelectedToppings({});
      setValidationErrors({});
    }
  }, [isOpen]);

  // ── Conditional visibility: filter categories based on trigger selections ──
  const visibleCategories = useMemo(() => {
    if (!availableCategories) return [];
    return availableCategories.filter((category: any) => {
      // If no visibility condition set, always show
      if (!category.visibleWhenCategoryId || !category.visibleWhenToppingIds?.length) {
        return true;
      }
      // Check if any of the trigger toppings are selected in the trigger category
      const triggerSelections = selectedToppings[category.visibleWhenCategoryId] || [];
      return triggerSelections.some(t =>
        category.visibleWhenToppingIds.includes(t.toppingId)
      );
    });
  }, [availableCategories, selectedToppings]);

  // Auto-clear selections from categories that become hidden
  useEffect(() => {
    if (!availableCategories) return;
    const visibleIds = new Set(visibleCategories.map((c: any) => c.id));
    const hiddenCategoryIds = availableCategories
      .filter((c: any) => !visibleIds.has(c.id) && c.visibleWhenCategoryId)
      .map((c: any) => c.id);

    if (hiddenCategoryIds.length === 0) return;

    setSelectedToppings(prev => {
      const hasStaleSelections = hiddenCategoryIds.some(id => prev[id]?.length > 0);
      if (!hasStaleSelections) return prev;
      const next = { ...prev };
      hiddenCategoryIds.forEach(id => { delete next[id]; });
      return next;
    });
  }, [visibleCategories, availableCategories]);

  // MEMOIZATION: Calculate complex pricing fields only when dependencies change
  const allSelectedToppings = useMemo(() => Object.values(selectedToppings).flat(), [selectedToppings]);
  const currentPrice = useMemo(() => getBasePrice(item as any), [item]);
  const totalPrice = useMemo(() => calculateTotalPrice(item as any, allSelectedToppings), [item, allSelectedToppings]);

  // MEMOIZATION: Wrap heavy callback toggles
  const handleToppingToggle = useCallback((categoryId: string, toppingId: string, name: string, price: number | undefined) => {
    const category = availableCategories?.find((cat: any) => cat.id === categoryId);
    if (!category) return;

    setSelectedToppings(prev => {
      const categoryToppings = prev[categoryId] || [];
      const isSelected = categoryToppings.some(t => t.toppingId === toppingId);

      if (isSelected) {
        return {
          ...prev,
          [categoryId]: categoryToppings.filter(t => t.toppingId !== toppingId),
        };
      } else {
        if (category.maxSelection && categoryToppings.length >= category.maxSelection) {
          return prev;
        }
        return {
          ...prev,
          [categoryId]: [...categoryToppings, { toppingId, name, price, categoryName: category?.name, freeForBogo: category?.freeForBogo ?? false, tvaPercent: category?.toppings?.find((t: any) => t.id === toppingId)?.tvaPercent }],
        };
      }
    });

    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[categoryId];
      return newErrors;
    });
  }, [availableCategories]);

  // Validate only visible categories
  const validateSelections = useCallback(() => {
    const errors: Record<string, string> = {};

    visibleCategories?.forEach((category: any) => {
      const categoryToppings = selectedToppings[category.id] || [];
      const count = categoryToppings.length;

      if (category.minSelection > 0 && count < category.minSelection) {
        errors[category.id] = `Veuillez sélectionner au moins ${category.minSelection} option(s)`;
      }
    });

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstErrorId = visibleCategories?.find((c: any) => errors[c.id])?.id;
      if (firstErrorId) {
        // Use setTimeout to ensure DOM has updated with the error message before scrolling
        setTimeout(() => {
          const element = document.getElementById(`category-${firstErrorId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 50);
      }
    }

    return Object.keys(errors).length === 0;
  }, [visibleCategories, selectedToppings]);

  const handleAddToOrder = useCallback(() => {
    if (!validateSelections()) {
      return;
    }

    const orderItem: OrderItem = {
      id: `${item._id}-${Date.now()}`,
      menuItemId: item._id,
      name: item.name,
      image: item.image,
      basePrice: currentPrice,
      selectedToppings: allSelectedToppings,
      totalPrice: totalPrice,
      tvaPercent: (item as any).tvaPercent,
    };

    addToOrder(orderItem);
    onClose();
  }, [item, currentPrice, allSelectedToppings, totalPrice, validateSelections, addToOrder, onClose]);

  const getSelectionStatus = useCallback((categoryId: string) => {
    const category = availableCategories?.find((cat: any) => cat.id === categoryId);
    if (!category) return '';

    const count = (selectedToppings[categoryId] || []).length;

    if (category.maxSelection) {
      return `${count}/${category.maxSelection}`;
    }
    return `${count}`;
  }, [availableCategories, selectedToppings]);

  const isToppingDisabled = useCallback((categoryId: string, toppingId: string) => {
    const category = availableCategories?.find((cat: any) => cat.id === categoryId);
    if (!category || !category.maxSelection) return false;

    const categoryToppings = selectedToppings[categoryId] || [];
    const isSelected = categoryToppings.some(t => t.toppingId === toppingId);

    return !isSelected && categoryToppings.length >= category.maxSelection;
  }, [availableCategories, selectedToppings]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] md:max-h-[85vh] flex flex-col mx-4 overflow-hidden">
        {/* Absolute Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 font-display">{item.name}</h2>
          <p className="text-gray-600 mb-6">{item.description}</p>

          {visibleCategories && visibleCategories.length > 0 && (
            <div className="space-y-6">
              {visibleCategories.map((category: any) => (
                <ToppingCategory
                  key={category.id}
                  category={category}
                  selectedToppings={selectedToppings}
                  validationError={validationErrors[category.id]}
                  onToggleTopping={handleToppingToggle}
                  getSelectionStatus={getSelectionStatus}
                  isToppingDisabled={isToppingDisabled}
                />
              ))}
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="border-t bg-gray-50 p-6 flex-shrink-0 rounded-b-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold text-gray-900 font-display">Total</span>
            <span className="text-2xl font-bold text-primary-600 font-display">
              {formatPrice(totalPrice)}
            </span>
          </div>

          <button
            onClick={handleAddToOrder}
            className="w-full bg-primary-600 text-white py-4 rounded-xl font-display text-2xl hover:bg-primary-700 transition-colors tracking-wide"
          >
            Ajouter à la commande
          </button>
        </div>
      </div>
    </div>
  );
}
