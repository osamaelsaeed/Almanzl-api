import express from 'express';
import {
    addProduct,
    deleteProduct,
    getAllProducts,
    getProduct,
    getSimilarProducts,
    updateProduct,
    getProductsByCategoryId,
} from '../controllers/product.controller.js';
import { upload } from '../middlewares/upload.js';
import reviewRouter from './review.routes.js';
import { isAdmin, protect } from '../middlewares/protect.middleware.js';

const router = express.Router();

router.use('/:id/reviews', reviewRouter);

router.route('/').get(getAllProducts).post(protect, isAdmin, upload.array('images', 8), addProduct);

router
    .route('/:id')
    .get(getProduct)
    .patch(protect, isAdmin, upload.array('images', 8), updateProduct)
    .delete(protect, isAdmin, deleteProduct);

router.get('/:id/similar', getSimilarProducts);

router.get('/category/:categoryId', getProductsByCategoryId);

export default router;
