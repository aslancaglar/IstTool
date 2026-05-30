"use client";

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../../src/context/AuthContext';
import { useAuthModal } from '../../src/context/AuthModalContext';
import { LogOut, Settings, ShoppingBag, User as UserIcon } from 'lucide-react';
import OrdersList from '../../src/components/account/OrdersList';
import OrderDetail from '../../src/components/account/OrderDetail';
import ProfileSection, { type ProfileFormData } from '../../src/components/account/ProfileSection';
import RatingModal from '../../src/components/account/RatingModal';

type Tab = 'profile' | 'orders';

export default function AccountPage() {
  const { user, logout, updateUser, sessionToken, isLoading } = useAuth();
  const { openLoginModal } = useAuthModal();
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const orders = useQuery(
    api.auth.listUserOrders,
    user && sessionToken ? { userId: user.id as any, sessionToken } : 'skip'
  );
  const addReview = useMutation(api.reviews.addOrderReview);
  const updateProfile = useMutation(api.auth.updateUser);

  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: user?.street || '',
    city: user?.city || '',
    zipCode: user?.zipCode || ''
  });

  const selectedOrder = useMemo(() =>
    orders?.find(o => o._id === selectedOrderId),
    [orders, selectedOrderId]);

  useEffect(() => {
    if (!isLoading && !user) {
      openLoginModal('/account');
    }
  }, [isLoading, user, openLoginModal]);

  if (isLoading || !user) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        id: user.id as any,
        sessionToken: sessionToken ?? undefined,
        ...formData
      });
      updateUser(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Erreur lors de la mise à jour du profil.');
    }
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId || !sessionToken) return;

    setIsSubmittingRating(true);
    try {
      await addReview({
        sessionToken,
        orderId: selectedOrderId as any,
        rating,
        comment,
      });
      setIsRatingOpen(false);
      setRating(5);
      setComment('');
      alert('Merci pour votre avis !');
    } catch (error: any) {
      alert(error.message || 'Une erreur est survenue.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 hidden">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <UserIcon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900">
                Bonjour, {user.firstName}
              </h1>
              <p className="text-gray-500">Gérez votre profil et vos commandes</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-bold rounded-xl shadow-sm hover:shadow-md hover:text-red-600 transition-all border border-gray-100"
          >
            <LogOut className="w-5 h-5" />
            Se déconnecter
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-2">
            <button
              onClick={() => { setActiveTab('orders'); setSelectedOrderId(null); }}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'orders'
                ? 'bg-red-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
            >
              <ShoppingBag className="w-5 h-5" />
              Mes Commandes
            </button>
            <button
              onClick={() => { setActiveTab('profile'); setSelectedOrderId(null); }}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'profile'
                ? 'bg-red-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
            >
              <Settings className="w-5 h-5" />
              Mon Profil
            </button>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all bg-white text-gray-600 hover:bg-red-50 hover:text-red-600 group"
            >
              <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
              Se déconnecter
            </button>
          </div>

          <div className="lg:col-span-3">
            {activeTab === 'orders' ? (
              selectedOrderId && selectedOrder ? (
                <OrderDetail
                  order={selectedOrder}
                  user={user}
                  sessionToken={sessionToken}
                  detailsOpen={detailsOpen}
                  onToggleDetails={() => setDetailsOpen(!detailsOpen)}
                  onBack={() => setSelectedOrderId(null)}
                  onLeaveReview={() => setIsRatingOpen(true)}
                />
              ) : (
                <OrdersList
                  orders={orders}
                  onSelect={(id) => { setSelectedOrderId(id); setDetailsOpen(false); }}
                />
              )
            ) : (
              <ProfileSection
                user={user}
                isEditing={isEditing}
                formData={formData}
                setFormData={setFormData}
                onStartEdit={() => setIsEditing(true)}
                onCancelEdit={() => setIsEditing(false)}
                onSubmit={handleUpdateProfile}
              />
            )}
          </div>
        </div>
      </div>

      <RatingModal
        isOpen={isRatingOpen}
        rating={rating}
        comment={comment}
        isSubmitting={isSubmittingRating}
        onClose={() => setIsRatingOpen(false)}
        onRatingChange={setRating}
        onCommentChange={setComment}
        onSubmit={handleSubmitRating}
      />
    </div>
  );
}
