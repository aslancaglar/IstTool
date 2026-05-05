"use client";

import { CheckCircle2, Star, X } from 'lucide-react';

interface RatingModalProps {
  isOpen: boolean;
  rating: number;
  comment: string;
  isSubmitting: boolean;
  onClose: () => void;
  onRatingChange: (rating: number) => void;
  onCommentChange: (comment: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function RatingModal({
  isOpen, rating, comment, isSubmitting, onClose, onRatingChange, onCommentChange, onSubmit,
}: RatingModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 pb-0 flex justify-between items-center">
          <h2 className="text-2xl font-display font-black text-gray-900">Votre avis</h2>
          <button onClick={onClose} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <p className="text-center text-gray-500 font-medium">Comment s'est passée votre commande ?</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => onRatingChange(star)}
                  className={`p-2 transition-transform hover:scale-110 ${star <= rating ? 'text-orange-400' : 'text-gray-200'}`}
                >
                  <Star className={`w-10 h-10 ${star <= rating ? 'fill-current' : ''}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900 ml-1">Commentaire</label>
            <textarea
              value={comment}
              onChange={(e) => onCommentChange(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-red-500 transition-all min-h-[120px] resize-none"
              placeholder="Partagez votre expérience..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-5 bg-red-500 text-white font-black rounded-2xl shadow-xl shadow-red-200 hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Publier l'avis
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
