import Review from '../models/review.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as factory from '../utils/handlerFactory.js';
import { FAIL } from '../utils/reposnseStatus.js';

export const setReviewProductAndUserIds = (req, res, next) => {
    if (!req.body.product) req.body.product = req.params.id;
    if (!req.body.user) req.body.user = req.user.id;
    next();
};

export const getAllReviews = factory.getAll(Review, null, { id: 'product' });
export const createReview = asyncHandler(async (req, res, next) => {
    const exists = await Review.exists({ user: req.id });
    if (exists) {
        return res.status(409).json({
            status: FAIL,
            message: "You've already reviewed this product.",
        });
    }
    return factory.createOne(Review)(req, res, next);
});

export const updateReview = factory.updateOne(Review);
export const deleteReview = factory.deleteOne(Review);
