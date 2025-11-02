import express from 'express';
import * as reviewController from '../controllers/review.controller.js';
import * as authController from '../controllers/auth.controller.js';

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(reviewController.setReviewProductAndUserIds, reviewController.createReview);

router.route('/:id').patch(reviewController.updateReview).delete(reviewController.deleteReview);

export default router;
