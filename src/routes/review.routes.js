import express from 'express';
import * as reviewController from '../controllers/review.controller.js';
import { protect } from '../middlewares/protect.middleware.js';
import restrictToOwner from '../utils/checkOwner.js';
import Review from '../models/review.model.js';

const router = express.Router({ mergeParams: true });

router.get('/', reviewController.getAllReviews);

router.use(protect);
router.post('/', reviewController.setReviewProductAndUserIds, reviewController.createReview);
router
    .route('/:id')
    .patch(
        restrictToOwner(Review, 'You can update your review only'),
        reviewController.updateReview
    )
    .delete(
        restrictToOwner(Review, 'You can delete your review only'),
        reviewController.deleteReview
    );

export default router;
