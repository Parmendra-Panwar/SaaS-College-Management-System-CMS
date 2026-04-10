import { useState } from 'react';
import { createReview } from '../services/reviewService';

const ReviewSection = ({ reviews, entityType, entityId, onReviewAdded }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // entityType will be "listings", "trips", etc.
            const response = await createReview(entityType, entityId, { rating, comment });

            setComment("");
            setRating(5);
            if (onReviewAdded) onReviewAdded(response.data.review);
        } catch (error) {
            console.error("Review failed:", error.response?.data || error.message);
            alert(error.response?.data?.error || "Failed to add review.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="border-t pt-8 w-full mt-8">
            <h3 className="text-xl font-bold mb-6">
                ★ {reviews?.length > 0 ? "5.0" : "New"} · {reviews?.length || 0} Reviews
            </h3>

            <form onSubmit={handleSubmit} className="mb-8 p-6 bg-slate-50 border rounded-3xl">
                <h4 className="font-semibold mb-4 text-lg">Add a Review</h4>
                <div className="flex gap-4 mb-4">
                    <div className="flex flex-col">
                        <label className="text-sm font-medium mb-1">Rating</label>
                        <input
                            type="number" min="1" max="5"
                            value={rating} onChange={(e) => setRating(e.target.value)}
                            className="w-24 p-2 border rounded-xl border-slate-200 focus:ring-2 focus:ring-[#FF385C] outline-none transition"
                        />
                    </div>
                </div>
                <textarea
                    required placeholder="What was your experience like?"
                    value={comment} onChange={(e) => setComment(e.target.value)}
                    className="w-full p-4 border border-slate-200 rounded-2xl mb-4 focus:ring-2 focus:ring-[#FF385C] outline-none transition"
                    rows="3"
                ></textarea>
                <button
                    type="submit"
                    disabled={loading}
                    className="cursor-pointer bg-[#222222] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#FF385C] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Posting..." : "Post Review"}
                </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews?.map(rev => (
                    <div key={rev._id} className="p-5 border rounded-3xl hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold">{rev.author?.username || "Guest User"}</span>
                            <span className="text-rose-500 font-semibold">★ {rev.rating || 3}</span>
                        </div>
                        <p className="text-slate-600 italic">"{rev.comment}"</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReviewSection;