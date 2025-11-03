import express from 'express';
import * as reviewController from '../controllers/review.controller.js';
import { protect } from '../middlewares/protect.middleware.js';
import restrictToOwner from '../models/checkOwner.js';
import Review from '../models/review.model.js';

const router = express.Router({ mergeParams: true });

router.use(protect);

router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(reviewController.setReviewProductAndUserIds, reviewController.createReview);

router
    .route('/:id')
    .patch(restrictToOwner(Review), reviewController.updateReview)
    .delete(restrictToOwner(Review), reviewController.deleteReview);

export default router;
