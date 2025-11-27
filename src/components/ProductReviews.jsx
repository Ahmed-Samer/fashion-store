import React, { useState, useEffect } from 'react';
import { Star, Send, User } from 'lucide-react';
import { collection, addDoc, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db, getAppId } from '../firebase';
import { motion } from 'framer-motion';

const ProductReviews = ({ productId, user }) => {
  const appId = getAppId();
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '', name: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // جلب التقييمات الخاصة بالمنتج ده بس
  useEffect(() => {
    const q = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'reviews'),
      where('productId', '==', productId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReviews(data);
    });

    return () => unsubscribe();
  }, [productId, appId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.comment.trim()) return;
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'reviews'), {
        productId,
        userName: user?.displayName || newReview.name || 'Anonymous',
        rating: newReview.rating,
        comment: newReview.comment,
        createdAt: new Date().toISOString(),
        userId: user?.uid || 'guest'
      });
      setNewReview({ rating: 5, comment: '', name: '' });
    } catch (error) {
      console.error("Error adding review: ", error);
    }
    setIsSubmitting(false);
  };

  // حساب متوسط التقييم
  const averageRating = reviews.length 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1) 
    : 0;

  return (
    <div className="mt-16 border-t border-slate-200 dark:border-slate-700 pt-10 animate-fade-in">
      <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
        Reviews <span className="text-sm font-normal text-slate-500 dark:text-slate-400">({reviews.length})</span>
        {reviews.length > 0 && (
            <div className="flex items-center gap-1 text-yellow-400 text-sm bg-yellow-400/10 px-2 py-1 rounded-lg">
                <Star size={14} fill="currentColor" /> {averageRating}
            </div>
        )}
      </h3>

      <div className="grid md:grid-cols-2 gap-12">
        {/* 1. نموذج إضافة تقييم */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 h-fit">
          <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-4">Write a Review</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!user && (
                <input 
                    className="w-full p-3 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 outline-none text-sm dark:text-white"
                    placeholder="Your Name"
                    value={newReview.name}
                    onChange={e => setNewReview({...newReview, name: e.target.value})}
                    required
                />
            )}
            
            <div className="flex gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewReview({ ...newReview, rating: star })}
                  className={`transition-all hover:scale-110 ${star <= newReview.rating ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600'}`}
                >
                  <Star fill={star <= newReview.rating ? "currentColor" : "none"} size={24} />
                </button>
              ))}
            </div>

            <textarea
              className="w-full p-4 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 outline-none text-sm h-32 resize-none dark:text-white placeholder:text-slate-400"
              placeholder="Share your thoughts..."
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              required
            />

            <motion.button 
                whileTap={{ scale: 0.95 }}
                disabled={isSubmitting}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Publishing...' : <>Publish Review <Send size={16} /></>}
            </motion.button>
          </form>
        </div>

        {/* 2. قائمة التقييمات */}
        <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
          {reviews.length === 0 ? (
            <div className="text-center py-10 text-slate-400 italic">No reviews yet. Be the first!</div>
          ) : (
            reviews.map((review) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={review.id} 
                className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center text-violet-600 dark:text-violet-300">
                      <User size={14} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-800 dark:text-white">{review.userName}</p>
                      <p className="text-[10px] text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-slate-200 dark:text-slate-700"} />
                    ))}
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{review.comment}</p>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductReviews;