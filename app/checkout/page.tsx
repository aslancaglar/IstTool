"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '../../src/context/OrderContext';
import { useAuth } from '../../src/context/AuthContext';
import { useAuthModal } from '../../src/context/AuthModalContext';
import { useMutation, useQuery, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { calculateDeliveryFee } from '../../src/utils/deliveryFeeCalculator';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

// Modular Components
import CheckoutStepper from '../../src/components/checkout/CheckoutStepper';
import OrderTypeSelector from '../../src/components/checkout/OrderTypeSelector';
import OrderSummary from '../../src/components/checkout/OrderSummary';
import CustomerInfoSection from '../../src/components/checkout/CustomerInfoSection';
import PaymentSection from '../../src/components/checkout/PaymentSection';

type Step = 'details' | 'payment';

export default function CheckoutPage() {
    const router = useRouter();
    const { orderItems, isInitialized, getTotalPrice, clearOrder } = useOrder();
    const { user, sessionToken, isLoading: authLoading } = useAuth();
    const { openLoginModal } = useAuthModal();
    const restaurantInfo = useQuery(api.restaurantInfo.get);
    const createOrder = useMutation(api.mutations.createOrder);

    // State
    const [step, setStep] = useState<Step>('details');
    const [orderType, setOrderType] = useState<'pickup' | 'delivery'>('pickup');
    const [scheduledTime, setScheduledTime] = useState<string>('asap');
    const [customer, setCustomer] = useState({ firstName: '', lastName: '', email: '', phone: '' });
    const [address, setAddress] = useState({ street: '', city: '', zipCode: '', instructions: '' });
    const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cash'>('cash');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [stripeError, setStripeError] = useState<string | null>(null);
    const [showStripeForm, setShowStripeForm] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; show: boolean } | null>(null);
    const [isRedirecting, setIsRedirecting] = useState(false);

    const updateUser = useMutation(api.auth.updateUser);

    // Delivery Logic
    const deliveryFeeInfo = useMemo(() => {
        const subtotal = getTotalPrice();
        if (orderType !== 'delivery' || !address.zipCode) return { price: 0, matched: false };
        const feeInfo = calculateDeliveryFee(address.zipCode, restaurantInfo?.deliveryFees, restaurantInfo?.defaultDeliveryFee ?? 0);
        
        // Apply free delivery threshold if set
        if (restaurantInfo?.freeDeliveryThreshold && restaurantInfo.freeDeliveryThreshold > 0 && subtotal >= restaurantInfo.freeDeliveryThreshold) {
            return { ...feeInfo, price: 0 };
        }
        
        return feeInfo;
    }, [orderType, address.zipCode, restaurantInfo, getTotalPrice]);

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
        } catch (error) {
            showToast('Erreur d\'enregistrement', 'error');
        }
    };

    const createPaymentIntentAction = useAction(api.stripe.createPaymentIntent);

    const createPaymentIntent = async () => {
        setStripeError(null);
        try {
            const amount = getTotalPrice() + (orderType === 'delivery' ? deliveryFeeInfo.price : 0);
            const { clientSecret } = await createPaymentIntentAction({ amount });
            if (clientSecret) {
                setClientSecret(clientSecret);
                setShowStripeForm(true);
            } else {
                setStripeError('Erreur d\'initialisation du paiement');
            }
        } catch (error: any) {
            console.error('Error in createPaymentIntent:', error);
            setStripeError(error.message || 'Erreur de connexion avec le service de paiement');
            setShowStripeForm(false);
        }
    };

    const handleFinalOrder = async (pMethod: 'stripe' | 'cash', pStatus: 'paid' | 'unpaid', pIntentId?: string) => {
        setIsSubmitting(true);
        try {
            const orderId = await createOrder({
                sessionToken: sessionToken ?? undefined,
                customer,
                type: orderType,
                address: orderType === 'delivery' ? address : undefined,
                scheduledTime,
                paymentMethod: pMethod,
                paymentStatus: pStatus,
                stripePaymentIntentId: pIntentId,
                totalPrice: getTotalPrice() + (orderType === 'delivery' ? deliveryFeeInfo.price : 0),
                items: orderItems.map(item => ({
                    menuItemId: item.menuItemId,
                    name: item.name,
                    price: item.basePrice,
                    
                    selectedToppings: item.selectedToppings.map(t => ({ categoryId: '', toppingIds: [t.toppingId] })),
                    finalPrice: item.totalPrice
                }))
            });
            setIsRedirecting(true);
            clearOrder();
            router.push(`/order-success/${orderId}`);
        } catch (error) {
            setStripeError('Erreur lors de la création de la commande.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isInitialized || isRedirecting) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (orderItems.length === 0) return (
        <div className="flex flex-col min-h-screen bg-gray-50 pt-32 items-center justify-center p-4">
            <ShoppingBag className="w-16 h-16 text-gray-200 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Votre panier est vide</h2>
            <button onClick={() => router.push('/menu')} className="bg-red-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-red-600 transition-all shadow-lg">Voir le menu</button>
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-32 pb-20">
                <div className="mb-8">
                    <CheckoutStepper currentStep={step} />
                </div>
                <div className={`flex ${step === 'payment' ? 'flex-col-reverse' : 'flex-col'} lg:flex-row gap-8 items-start`}>
                    {/* Left Column: Flow */}
                    <div className="w-full lg:flex-1 space-y-6">

                        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8 md:p-12 transition-all">
                            {step === 'details' ? (
                                <div className="space-y-10">
                                    <OrderTypeSelector
                                        orderType={orderType}
                                        setOrderType={setOrderType}
                                        restaurantInfo={restaurantInfo}
                                        isDefaultAddressOutsideZone={isDefaultAddressOutsideZone}
                                    />

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

                                    <button
                                        onClick={() => setStep('payment')}
                                        disabled={!customer.firstName || !customer.phone || (orderType === 'delivery' && (!address.street || !isDeliverySupported))}
                                        className="w-full bg-red-600 text-white font-black py-5 rounded-2xl hover:bg-black transition-all shadow-xl shadow-red-600/20 disabled:opacity-30 flex items-center justify-center gap-3 uppercase tracking-tighter text-sm"
                                    >
                                        Continuer vers le paiement
                                    </button>
                                </div>
                            ) : (
                                <PaymentSection
                                    paymentMethod={paymentMethod}
                                    setPaymentMethod={setPaymentMethod}
                                    showStripeForm={showStripeForm}
                                    setShowStripeForm={setShowStripeForm}
                                    clientSecret={clientSecret}
                                    stripeError={stripeError}
                                    setStripeError={setStripeError}
                                    createPaymentIntent={createPaymentIntent}
                                    handleStripeSuccess={(pid) => handleFinalOrder('stripe', 'paid', pid)}
                                    handleStripeError={setStripeError}
                                    handleSubmit={() => handleFinalOrder('cash', 'unpaid')}
                                    isSubmitting={isSubmitting}
                                    totalPrice={getTotalPrice() + (orderType === 'delivery' ? deliveryFeeInfo.price : 0)}
                                />
                            )}
                        </div>

                        {step === 'payment' && (
                            <button onClick={() => setStep('details')} className="flex items-center gap-2 text-gray-400 font-bold uppercase tracking-widest text-[10px] hover:text-red-500 transition-colors ml-4 pt-2">
                                <ArrowLeft className="w-3 h-3" /> Retour aux détails
                            </button>
                        )}
                    </div>

                    {/* Right Column: Summary */}
                    <aside className="w-full lg:w-[400px] shrink-0 lg:sticky lg:top-24">
                        <OrderSummary
                            orderItems={orderItems}
                            subtotal={getTotalPrice()}
                            deliveryFee={deliveryFeeInfo.price}
                            totalWithDelivery={getTotalPrice() + deliveryFeeInfo.price}
                            orderType={orderType}
                            isDeliverySupported={isDeliverySupported}
                            freeDeliveryThreshold={restaurantInfo?.freeDeliveryThreshold}
                        />
                    </aside>
                </div>
            </main>

            {/* Toast Notifications */}
            {toast?.show && (
                <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300 ${toast.type === 'success' ? 'bg-gray-900 text-white' : 'bg-red-500 text-white'}`}>
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                        <ShoppingBag className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm tracking-wide">{toast.message}</span>
                </div>
            )}
        </div>
    );
}
