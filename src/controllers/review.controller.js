import Review from '../models/review.model.js';
import * as factory from '../utils/handlerFactory.js';

export const setReviewProductAndUserIds = (req, res, next) => {
    if (!req.body.product) req.body.product = req.params.id;
    if (!req.body.user) req.body.user = req.user.id;
    next();
};

export const getAllReviews = factory.getAll(Review);
export const createReview = factory.createOne(Review);
export const updateReview = factory.updateOne(Review);
export const deleteReview = factory.deleteOne(Review);
