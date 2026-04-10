import api from './authService';

export const createReview = async (type, id, reviewData) => {
    // URL example: /listings/67890/reviews
    return await api.post(`/${type}/${id}/reviews`, { review: reviewData });
};

export const deleteReview = async (type, id, reviewId) => {
    // URL example: /listings/67890/reviews/12345
    return await api.delete(`/${type}/${id}/reviews/${reviewId}`);
};