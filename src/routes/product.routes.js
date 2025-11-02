import express from 'express';
import {
    addProduct,
    deleteProduct,
    getAllProducts,
    getProduct,
    getSimilarProducts,
    updateProduct,
} from '../controllers/product.controller.js';
import { upload } from '../middlewares/upload.js';
import reviewRouter from './review.routes.js';

const router = express.Router();

router.use('/:id/reviews', reviewRouter);

router.route('/').get(getAllProducts).post(upload.array('images', 8), addProduct);

router
    .route('/:id')
    .get(getProduct)
    .patch(upload.array('images', 8), updateProduct)
    .delete(deleteProduct);

router.get('/:id/similar', getSimilarProducts);

export default router;
