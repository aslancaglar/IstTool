import { Check } from 'lucide-react';
import { formatPrice } from '../utils/formatters';

interface ToppingCategoryProps {
    category: any;
    selectedToppings: Record<string, any[]>;
    validationError?: string;
    onToggleTopping: (categoryId: string, toppingId: string, name: string, price: number | undefined) => void;
    getSelectionStatus: (categoryId: string) => string;
    isToppingDisabled: (categoryId: string, toppingId: string) => boolean;
}

export default function ToppingCategory({
    category,
    selectedToppings,
    validationError,
    onToggleTopping,
    getSelectionStatus,
    isToppingDisabled,
}: ToppingCategoryProps) {
    return (
        <div id={`category-${category.id}`} className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-extrabold text-gray-900 font-display bg-primary-50 px-3 py-2 rounded-lg">
                    {category.name}
                    {category.minSelection > 0 && (
                        <span className="text-primary-500 ml-1">*</span>
                    )}
                </h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {getSelectionStatus(category.id)}
                    {category.maxSelection && ` max`}
                </span>
            </div>

            {validationError && (
                <div className="mb-3 text-sm text-primary-600 bg-primary-50 p-2 rounded">
                    {validationError}
                </div>
            )}

            <div className="grid grid-cols-2 gap-2">
                {category.toppings.map((topping: any) => {
                    const isSelected = (selectedToppings[category.id] || []).some(
                        t => t.toppingId === topping.id
                    );
                    const isDisabled = isToppingDisabled(category.id, topping.id);

                    return (
                        <button
                            key={topping.id}
                            onClick={() => onToggleTopping(
                                category.id,
                                topping.id,
                                topping.name,
                                topping.price
                            )}
                            disabled={isDisabled}
                            className={`p-3 rounded-lg border-2 text-left transition-all ${isSelected
                                    ? 'border-primary-500 bg-primary-50'
                                    : isDisabled
                                        ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        {topping.image && (
                                            <img src={topping.image} alt="" className="w-8 h-8 object-cover rounded-md flex-shrink-0" />
                                        )}
                                        <div className="text-sm font-medium text-gray-900">
                                            {topping.name}
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {topping.price !== undefined && topping.price > 0
                                            ? `+${formatPrice(topping.price)}`
                                            : 'Gratuit'}
                                    </div>
                                </div>
                                {isSelected && (
                                    <Check className="w-5 h-5 text-primary-500 flex-shrink-0" />
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
