"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '../../src/context/OrderContext';
import { useAuth } from '../../src/context/AuthContext';
import { useAuthModal } from '../../src/context/AuthModalContext';
import { useMutation, useQuery, useAction, useConvex } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { calculateDeliveryFee } from '../../src/utils/deliveryFeeCalculator';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

// Modular Components
import CheckoutStepper from '../../src/components/checkout/CheckoutStepper';
import OrderTypeSelector from '../../src/components/checkout/OrderTypeSelector';
import OrderSummary from '../../src/components/checkout/OrderSummary';
import CustomerInfoSection from '../../src/components/checkout/CustomerInfoSection';
import PaymentSection from '../../src/components/checkout/PaymentSection';
import { type StripeFormHandle } from '../../src/components/StripePaymentForm';

type Step = 'details' | 'payment';

export default function CheckoutPage() {
    const router = useRouter();
    const convex = useConvex();
    const { orderItems, isInitialized, getTotalPrice, clearOrder } = useOrder();
    const { user, sessionToken, isLoading: authLoading } = useAuth();
    const { openLoginModal } = useAuthModal();
    const restaurantInfo = useQuery(api.restaurantInfo.get);
    const createOrder = useMutation(api.mutations.createOrder);
    const confirmStripePayment = useAction(api.stripe.verifyAndConfirmPayment);

    // State
    const [step, setStep] = useState<Step>('details');
    const [orderType, setOrderType] = useState<'pickup' | 'delivery' | 'dine_in' | null>(null);
    const [scheduledTime] = useState<string>('asap');
    const [customer, setCustomer] = useState({ firstName: '', lastName: '', email: '', phone: '' });
    const [address, setAddress] = useState({ street: '', city: '', zipCode: '', instructions: '' });
    const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cash' | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [stripeError, setStripeError] = useState<string | null>(null);
    const [showStripeForm, setShowStripeForm] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; show: boolean } | null>(null);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [appliedPromoCode, setAppliedPromoCode] = useState<string | undefined>();
    const [discountAmount, setDiscountAmount] = useState(0);
    const [freeDeliveryFromPromo, setFreeDeliveryFromPromo] = useState(false);
    const stripeFormRef = useRef<StripeFormHandle>(null);
    const [isStripeProcessing, setIsStripeProcessing] = useState(false);

    const updateUser = useMutation(api.auth.updateUser);
    const activeCampaigns = useQuery(api.promoCodes.listActiveCampaigns);

    // Delivery Logic
    const deliveryFeeInfo = useMemo(() => {
        const subtotal = getTotalPrice();
        if (orderType !== 'delivery' || !address.zipCode) return { price: 0, matched: false };
        const feeInfo = calculateDeliveryFee(address.zipCode, restaurantInfo?.deliveryFees, restaurantInfo?.defaultDeliveryFee ?? 0);

        // 1. Check general threshold
        if (restaurantInfo?.freeDeliveryThreshold && restaurantInfo.freeDeliveryThreshold > 0 && subtotal >= restaurantInfo.freeDeliveryThreshold) {
            return { ...feeInfo, price: 0 };
        }

        // 2. Check zone-specific threshold
        if (feeInfo.matched && feeInfo.freeDeliveryThreshold && feeInfo.freeDeliveryThreshold > 0 && subtotal >= feeInfo.freeDeliveryThreshold) {
            return { ...feeInfo, price: 0 };
        }

        return feeInfo;
    }, [orderType, address.zipCode, restaurantInfo, getTotalPrice]);

    // Subtotal must be declared before campaign computation
    const subtotal = getTotalPrice();

    // Campaign auto-apply computation (mirrors server logic)
    const { campaignDiscount, campaignFreeDelivery, appliedCampaignIds, appliedCampaignList, bogoFreeItems } = useMemo(() => {
        const emptyReturn = { campaignDiscount: 0, campaignFreeDelivery: false, appliedCampaignIds: [] as string[], appliedCampaignList: [] as { id: string; description?: string; discountType: string; discountValue: number; computedDiscount: number; isFreeDelivery: boolean; bogoFreeCount?: number }[], bogoFreeItems: [] as { menuItemId: string; name: string; image?: string; selectedToppings: { toppingId: string; name: string; price?: number }[]; finalPrice: number }[] };
        if (!activeCampaigns || activeCampaigns.length === 0) return emptyReturn;
        const catMap = new Map(orderItems.map(item => [item.menuItemId, (item as any).categories ?? []]));
        let discount = 0;
        let freeDelivery = false;
        const ids: string[] = [];
        const list: { id: string; description?: string; discountType: string; discountValue: number; computedDiscount: number; isFreeDelivery: boolean; bogoFreeCount?: number }[] = [];
        const freeItems: { menuItemId: string; name: string; image?: string; selectedToppings: { toppingId: string; name: string; price?: number }[]; finalPrice: number }[] = [];

        for (const campaign of activeCampaigns) {
            if (campaign.minOrderAmount != null && subtotal < campaign.minOrderAmount) continue;
            if (campaign.timeWindow) {
                const nowParis = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
                const hour = nowParis.getHours();
                if (hour < campaign.timeWindow.startHour || hour >= campaign.timeWindow.endHour) continue;
            }
            let computedDiscount = 0;
            let isFreeDelivery = false;
            let bogoFreeCount: number | undefined = undefined;
            if (campaign.discountType === 'free_delivery') {
                if (orderType !== 'delivery') continue;
                freeDelivery = true;
                isFreeDelivery = true;
            } else if (campaign.discountType === 'percent_off_items') {
                const cats = campaign.applicableCategoryIds ?? [];
                const eligible = orderItems
                    .filter(item => (catMap.get(item.menuItemId) ?? []).some((c: string) => cats.includes(c)))
                    .reduce((sum, item) => sum + item.totalPrice, 0);
                computedDiscount = Math.round(Math.min(eligible * campaign.discountValue / 100, eligible) * 100) / 100;
            } else if (campaign.discountType === 'percent_off_specific_items') {
                const eligibleIds = (campaign as any).applicableMenuItemIds ?? [];
                const eligible = orderItems
                    .filter(item => eligibleIds.includes(item.menuItemId))
                    .reduce((sum, item) => sum + item.totalPrice, 0);
                computedDiscount = Math.round(Math.min(eligible * campaign.discountValue / 100, eligible) * 100) / 100;
            } else if (campaign.discountType === 'bogo_same') {
                const eligibleIds: string[] = (campaign as any).applicableMenuItemIds ?? [];
                bogoFreeCount = 0;
                for (const item of orderItems) {
                    if (eligibleIds.length > 0 && !eligibleIds.includes(item.menuItemId)) continue;
                    // Taille toppings are free on the offert item (price→0), others are charged
                    const allToppingsForFree = item.selectedToppings.map((t: any) =>
                        t.freeForBogo === true ? { ...t, price: 0 } : t
                    );
                    const toppingFinalPrice = allToppingsForFree.reduce(
                        (sum: number, t: any) => sum + (t.price ?? 0), 0
                    );
                    freeItems.push({
                        menuItemId: item.menuItemId,
                        name: item.name,
                        image: (item as any).image,
                        selectedToppings: allToppingsForFree,
                        finalPrice: toppingFinalPrice,
                    });
                    bogoFreeCount++;
                }
                if (bogoFreeCount === 0) continue;
                // No monetary discount — free items are added to the order at €0
            } else if (campaign.discountType === 'bogo_gift') {
                const triggerItemId: string = (campaign as any).bogoTriggerItemId ?? '';
                const giftItemId: string = (campaign as any).bogoGiftItemId ?? '';
                const hasTrigger = orderItems.some(item => item.menuItemId === triggerItemId);
                const giftItems = orderItems.filter(item => item.menuItemId === giftItemId);
                if (hasTrigger && giftItems.length > 0) {
                    computedDiscount = Math.min(...giftItems.map(item => item.totalPrice));
                }
            } else if (campaign.discountType === 'percentage') {
                computedDiscount = Math.round(Math.min(subtotal * campaign.discountValue / 100, subtotal) * 100) / 100;
            } else if (campaign.discountType === 'fixed') {
                computedDiscount = Math.min(campaign.discountValue, subtotal);
            }
            const hasEffect = computedDiscount > 0 || isFreeDelivery || (bogoFreeCount ?? 0) > 0;
            if (!hasEffect) continue;
            discount += computedDiscount;
            ids.push(campaign._id);
            list.push({ id: campaign._id, description: campaign.description, discountType: campaign.discountType, discountValue: campaign.discountValue, computedDiscount, isFreeDelivery, bogoFreeCount });
        }
        return { campaignDiscount: Math.round(discount * 100) / 100, campaignFreeDelivery: freeDelivery, appliedCampaignIds: ids, appliedCampaignList: list, bogoFreeItems: freeItems };
    }, [activeCampaigns, subtotal, orderType, orderItems]);

    // Effective delivery fee (zeroed when free delivery promo or campaign applied)
    const effectiveDeliveryFee = (freeDeliveryFromPromo || campaignFreeDelivery) ? 0 : deliveryFeeInfo.price;

    const isDeliverySupported = useMemo(() => {
        if (orderType !== 'delivery' || !address.zipCode) return true;
        if (!restaurantInfo?.deliveryFees?.length) return true;
        return deliveryFeeInfo.matched;
    }, [orderType, address.zipCode, restaurantInfo, deliveryFeeInfo]);

    const isDefaultAddressOutsideZone = useMemo(() => {
        if (!user?.zipCode || !restaurantInfo?.deliveryFees?.length) return false;
        const feeInfo = calculateDeliveryFee(user.zipCode, restaurantInfo.deliveryFees, restaurantInfo.defaultDeliveryFee ?? 0);
        return !feeInfo.matched;
    }, [user, restaurantInfo]);

    // Computed totals
    const bogoFreeTotal = bogoFreeItems.reduce((sum, item) => sum + item.finalPrice, 0);
    const totalBeforeDiscount = subtotal + effectiveDeliveryFee + bogoFreeTotal;
    const finalTotal = Math.max(0, totalBeforeDiscount - discountAmount - campaignDiscount);

    // Effects
    useEffect(() => {
        if (!authLoading && !user) openLoginModal('/checkout');
    }, [user, authLoading, openLoginModal]);

    useEffect(() => {
        if (user) {
            setCustomer({ firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone || '' });
            if (user.street || user.city || user.zipCode) {
                setAddress(prev => ({ ...prev, street: user.street || '', city: user.city || '', zipCode: user.zipCode || '' }));
            }
        }
    }, [user]);

    // Auto-select active order type if there's only one, or reset if selected is disabled
    useEffect(() => {
        if (!restaurantInfo) return;
        const pickupEnabled = restaurantInfo.pickupEnabled ?? true;
        const deliveryEnabled = restaurantInfo.deliveryEnabled ?? true;
        const dineInEnabled = restaurantInfo.dineInEnabled ?? true;

        const enabledTypes: ('pickup' | 'delivery' | 'dine_in')[] = [];
        if (pickupEnabled) enabledTypes.push('pickup');
        if (deliveryEnabled) enabledTypes.push('delivery');
        if (dineInEnabled) enabledTypes.push('dine_in');

        if (orderType && !enabledTypes.includes(orderType)) {
            setOrderType(enabledTypes.length === 1 ? enabledTypes[0] : null);
        } else if (!orderType && enabledTypes.length === 1) {
            setOrderType(enabledTypes[0]);
        }
    }, [restaurantInfo, orderType]);

    // Reset promo when order type changes (free_delivery promo only valid for delivery)
    useEffect(() => {
        if (orderType !== 'delivery' && freeDeliveryFromPromo) {
            setAppliedPromoCode(undefined);
            setDiscountAmount(0);
            setFreeDeliveryFromPromo(false);
        }
    }, [orderType, freeDeliveryFromPromo]);

    // Helpers
    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type, show: true });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSaveUserInfo = async () => {
        if (!user?.id || !sessionToken) return;
        try {
            await updateUser({
                id: user.id as any,
                sessionToken,
                ...customer,
                street: orderType === 'delivery' ? address.street : undefined,
                city: orderType === 'delivery' ? address.city : undefined,
                zipCode: orderType === 'delivery' ? address.zipCode : undefined,
            });
            setIsEditingInfo(false);
            showToast('Informations enregistrées', 'success');
        } catch {
            showToast('Erreur d\'enregistrement', 'error');
        }
    };

    // Promo code validation — passes orderType and items for category-aware promos
    const validatePromo = useCallback(async (code: string) => {
        return await convex.query(api.promoCodes.validate, {
            code,
            orderSubtotal: subtotal,
            orderType: orderType ?? 'pickup',
            items: orderItems.map(item => ({
                menuItemId: item.menuItemId,
                price: item.totalPrice,
                categoryIds: (item as any).categories ?? [],
            })),
        });
    }, [convex, subtotal, orderType, orderItems]);

    const handlePromoApplied = useCallback((code: string, discount: number, isFreeDelivery?: boolean) => {
        setAppliedPromoCode(code);
        setDiscountAmount(discount);
        setFreeDeliveryFromPromo(isFreeDelivery ?? false);
    }, []);

    const handlePromoRemoved = useCallback(() => {
        setAppliedPromoCode(undefined);
        setDiscountAmount(0);
        setFreeDeliveryFromPromo(false);
    }, []);

    const createPaymentIntentAction = useAction(api.stripe.createPaymentIntent);
    const [stripeOrderId, setStripeOrderId] = useState<string | null>(null);

    const buildOrderArgs = (pMethod: 'stripe' | 'cash') => ({
        sessionToken: sessionToken ?? undefined,
        customer,
        type: orderType!,
        address: orderType === 'delivery' ? address : undefined,
        scheduledTime,
        paymentMethod: pMethod,
        totalPrice: subtotal + effectiveDeliveryFee + bogoFreeItems.reduce((sum, item) => sum + item.finalPrice, 0),
        promoCode: appliedPromoCode,
        deliveryFee: effectiveDeliveryFee,
        itemCategoryIds: orderItems.map(item => ({
            menuItemId: item.menuItemId,
            categoryIds: (item as any).categories ?? [],
        })),
        items: [
            ...orderItems.map(item => ({
                menuItemId: item.menuItemId,
                name: item.name,
                price: item.basePrice,
                selectedToppings: item.selectedToppings.map(t => ({ categoryId: '', toppingIds: [t.toppingId] })),
                finalPrice: item.totalPrice,
            })),
            ...bogoFreeItems.map(item => ({
                menuItemId: item.menuItemId,
                name: `${item.name} (offert)`,
                price: 0,
                selectedToppings: item.selectedToppings.map((t: any) => ({ categoryId: '', toppingIds: [t.toppingId] })),
                finalPrice: item.finalPrice,
                isFree: true,
            })),
        ],
        appliedCampaignIds,
    });

    // Stripe path: create the order first, then mint a PI bound to that order.
    // Server derives the PI amount from order.totalPrice — no client-supplied amount.
    const initStripePayment = async () => {
        setStripeError(null);
        try {
            const orderId = stripeOrderId ?? (await createOrder(buildOrderArgs('stripe') as any));
            setStripeOrderId(orderId as string);
            const { clientSecret: cs } = await createPaymentIntentAction({ orderId: orderId as any });
            if (cs) {
                setClientSecret(cs);
                setShowStripeForm(true);
            } else {
                setStripeError("Erreur d'initialisation du paiement");
            }
        } catch (error: any) {
            console.error('Error initializing Stripe payment:', error);
            setStripeError(error.message || 'Erreur de connexion avec le service de paiement');
            setShowStripeForm(false);
        }
    };

    const handleStripeSuccess = async (paymentIntentId: string) => {
        if (!stripeOrderId) {
            setStripeError("Commande introuvable, veuillez recommencer.");
            return;
        }
        setIsSubmitting(true);
        try {
            await confirmStripePayment({ paymentIntentId });
            setIsRedirecting(true);
            clearOrder();
            router.push(`/order-success/${stripeOrderId}`);
        } catch (error: any) {
            setStripeError(error.message ?? 'Erreur lors de la confirmation du paiement.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCashSubmit = async () => {
        setIsSubmitting(true);
        try {
            const orderId = await createOrder(buildOrderArgs('cash') as any);
            setIsRedirecting(true);
            clearOrder();
            router.push(`/order-success/${orderId}`);
        } catch (error: any) {
            setStripeError(error.message ?? 'Erreur lors de la création de la commande.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // If user goes back to step 1 after creating a Stripe order, drop the
    // stale PI/order so the next attempt rebuilds with fresh totals.
    const goBackToDetails = () => {
        setStep('details');
        setStripeOrderId(null);
        setClientSecret(null);
        setShowStripeForm(false);
        setStripeError(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (!isInitialized || isRedirecting) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
            <div className="w-12 h-12 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (orderItems.length === 0) return (
        <div className="flex flex-col min-h-screen bg-gray-50 pt-32 items-center justify-center p-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-100 to-rose-100 flex items-center justify-center mb-5 shadow-sm">
                <ShoppingBag className="w-10 h-10 text-orange-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Votre panier est vide</h2>
            <p className="text-gray-400 text-sm mb-6">Ajoutez des articles pour continuer</p>
            <button onClick={() => router.push('/menu')} className="bg-gradient-to-r from-orange-500 to-rose-600 text-white font-bold px-8 py-3 rounded-xl hover:from-orange-600 hover:to-rose-700 transition-all shadow-lg shadow-orange-500/25">
                Voir le menu
            </button>
        </div>
    );

    const orderSummaryProps = {
        orderItems,
        subtotal,
        deliveryFee: deliveryFeeInfo.price,
        effectiveDeliveryFee,
        totalWithDelivery: subtotal + effectiveDeliveryFee,
        orderType,
        isDeliverySupported,
        freeDeliveryThreshold: (restaurantInfo?.freeDeliveryThreshold && restaurantInfo.freeDeliveryThreshold > 0)
            ? restaurantInfo.freeDeliveryThreshold
            : (deliveryFeeInfo.matched ? deliveryFeeInfo.freeDeliveryThreshold : undefined),
        validatePromo,
        onPromoApplied: handlePromoApplied,
        onPromoRemoved: handlePromoRemoved,
        appliedPromoCode,
        discountAmount,
        freeDeliveryFromPromo,
        appliedCampaigns: appliedCampaignList,
        campaignDiscount,
        bogoFreeItems,
    };

    const continueDisabled = !orderType || !customer.firstName || !customer.phone || (orderType === 'delivery' && (!address.street || !isDeliverySupported));

    const goToPayment = () => {
        setStep('payment');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-32 pb-20 lg:pb-20">
                <div className="mb-6">
                    <CheckoutStepper currentStep={step} />
                </div>

                {step === 'details' ? (
                    /* ── Step 1: mobile stacked order, desktop 2-col ── */
                    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start pb-28 lg:pb-0">
                        {/* Left column */}
                        <div className="w-full lg:flex-1 flex flex-col gap-4">
                            {/* 1. Mode de récupération */}
                            <div className="bg-orange-50/70 rounded-2xl shadow-sm border border-orange-100 p-5 md:p-6">
                                <OrderTypeSelector
                                    orderType={orderType}
                                    setOrderType={setOrderType}
                                    restaurantInfo={restaurantInfo}
                                    isDefaultAddressOutsideZone={isDefaultAddressOutsideZone}
                                />
                            </div>

                            {/* 2. Mon Panier — mobile only (desktop uses aside) */}
                            <div className="lg:hidden">
                                <OrderSummary {...orderSummaryProps} />
                            </div>

                            {/* 3. Mes informations */}
                            <div className="bg-violet-50/70 rounded-2xl shadow-sm border border-violet-100 p-5 md:p-6">
                                <CustomerInfoSection
                                    user={user}
                                    customer={customer}
                                    setCustomer={setCustomer}
                                    address={address}
                                    setAddress={setAddress}
                                    orderType={orderType}
                                    isEditingInfo={isEditingInfo}
                                    setIsEditingInfo={setIsEditingInfo}
                                    isDeliverySupported={isDeliverySupported}
                                    handleSaveUserInfo={handleSaveUserInfo}
                                />
                            </div>

                            {/* Continue button — desktop only inline */}
                            <button
                                onClick={() => goToPayment()}
                                disabled={continueDisabled}
                                className="hidden lg:flex w-full bg-gradient-to-r from-orange-500 to-rose-600 text-white font-bold py-4 rounded-2xl hover:from-orange-600 hover:to-rose-700 hover:scale-[1.01] transition-all shadow-xl shadow-orange-500/20 disabled:opacity-30 disabled:scale-100 items-center justify-center gap-3 text-base"
                            >
                                Continuer vers le paiement
                                <ArrowLeft className="w-5 h-5 rotate-180" />
                            </button>
                        </div>

                        {/* Right sidebar — desktop only */}
                        <aside className="hidden lg:block lg:w-[380px] shrink-0 lg:sticky lg:top-24">
                            <OrderSummary {...orderSummaryProps} />
                        </aside>
                    </div>
                ) : (
                    /* ── Step 2: payment ── */
                    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start pb-28 lg:pb-0">
                        <div className="w-full lg:flex-1 flex flex-col gap-4">
                            {/* Back button — top, visible */}
                            <button
                                onClick={goBackToDetails}
                                className="flex items-center gap-2.5 self-start bg-white/80 backdrop-blur-sm border border-white shadow-sm text-gray-600 font-semibold text-sm px-4 py-2.5 rounded-xl hover:text-orange-500 hover:border-orange-200 hover:bg-orange-50 transition-all"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Retour aux détails
                            </button>

                            {/* Payment method + conditional forms */}
                            <div className="bg-emerald-50/60 rounded-2xl shadow-sm border border-emerald-100 p-5 md:p-6">
                                <PaymentSection
                                    paymentMethod={paymentMethod}
                                    setPaymentMethod={setPaymentMethod}
                                    showStripeForm={showStripeForm}
                                    setShowStripeForm={setShowStripeForm}
                                    clientSecret={clientSecret}
                                    stripeError={stripeError}
                                    setStripeError={setStripeError}
                                    createPaymentIntent={initStripePayment}
                                    handleStripeSuccess={handleStripeSuccess}
                                    handleStripeError={setStripeError}
                                    handleSubmit={handleCashSubmit}
                                    isSubmitting={isSubmitting}
                                    totalPrice={finalTotal}
                                    hideSubmitButton
                                    cashEnabled={restaurantInfo?.cashEnabled ?? true}
                                    stripeEnabled={restaurantInfo?.stripeEnabled ?? true}
                                    stripeFormRef={stripeFormRef}
                                    onStripeProcessingChange={setIsStripeProcessing}
                                />
                            </div>

                            {/* OrderSummary — mobile only */}
                            <div className="lg:hidden">
                                <OrderSummary {...orderSummaryProps} />
                            </div>

                            {/* Confirm button — desktop only inline */}
                            {paymentMethod && (
                                <button
                                    onClick={() => {
                                        if (paymentMethod === 'stripe') {
                                            stripeFormRef.current?.submit();
                                        } else {
                                            handleCashSubmit();
                                        }
                                    }}
                                    disabled={
                                        isSubmitting ||
                                        isStripeProcessing ||
                                        (paymentMethod === 'stripe' && !showStripeForm)
                                    }
                                    className={`hidden lg:flex w-full bg-gradient-to-r from-orange-500 to-rose-600 shadow-xl shadow-orange-500/25 text-white font-bold py-4 rounded-2xl hover:from-orange-600 hover:to-rose-700 hover:scale-[1.01] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 items-center justify-center gap-3 text-base ${(isSubmitting || isStripeProcessing) ? 'animate-pulse' : ''}`}
                                >
                                    {(isSubmitting || isStripeProcessing)
                                        ? <><ShoppingBag className="w-5 h-5 animate-bounce" /> Traitement en cours...</>
                                        : paymentMethod === 'stripe'
                                            ? <>Payer {finalTotal.toFixed(2)}€ <ArrowLeft className="w-5 h-5 rotate-180" /></>
                                            : <>Confirmer ma commande <ArrowLeft className="w-5 h-5 rotate-180" /></>
                                    }
                                </button>
                            )}
                        </div>

                        {/* Sidebar — desktop only */}
                        <aside className="hidden lg:block lg:w-[380px] shrink-0 lg:sticky lg:top-24">
                            <OrderSummary {...orderSummaryProps} />
                        </aside>
                    </div>
                )}
            </main>

            {/* Fixed bottom CTA — mobile only, step 2 */}
            {step === 'payment' && (
                <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 py-3">
                    {(() => {
                        const processing = isSubmitting || isStripeProcessing;
                        const stripeReady = paymentMethod === 'stripe' && showStripeForm;
                        const cashReady = paymentMethod === 'cash';
                        const ready = !processing && (stripeReady || cashReady);
                        const onClick = () => {
                            if (!ready) return;
                            if (paymentMethod === 'stripe') stripeFormRef.current?.submit();
                            else if (paymentMethod === 'cash') handleCashSubmit();
                        };
                        return (
                            <button
                                onClick={onClick}
                                className={`w-full font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 text-base ${
                                    processing
                                        ? 'bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow-lg shadow-orange-500/25 animate-pulse'
                                        : ready
                                        ? 'bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow-lg shadow-orange-500/25 active:scale-[0.98]'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                {processing
                                    ? <><ShoppingBag className="w-5 h-5 animate-bounce" /> Traitement en cours...</>
                                    : paymentMethod === 'stripe'
                                        ? <>Payer {finalTotal.toFixed(2)}€ <ArrowLeft className="w-5 h-5 rotate-180" /></>
                                        : <>Confirmer ma commande <ArrowLeft className="w-5 h-5 rotate-180" /></>
                                }
                            </button>
                        );
                    })()}
                </div>
            )}

            {/* Fixed bottom CTA — mobile only, step 1 */}
            {step === 'details' && (
                <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 py-3">
                    <button
                        onClick={() => !continueDisabled && goToPayment()}
                        className={`w-full font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 text-base ${
                            continueDisabled
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow-lg shadow-orange-500/25 active:scale-[0.98]'
                        }`}
                    >
                        Continuer vers le paiement
                        <ArrowLeft className="w-5 h-5 rotate-180" />
                    </button>
                </div>
            )}

            {/* Toast Notifications */}
            {toast?.show && (
                <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300 ${toast.type === 'success' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white' : 'bg-gradient-to-r from-red-500 to-rose-600 text-white'}`}>
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                        <ShoppingBag className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm">{toast.message}</span>
                </div>
            )}
        </div>
    );
}
