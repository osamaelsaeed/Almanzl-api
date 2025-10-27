import express from 'express';
import {
    addProduct,
    deleteProduct,
    getAllProducts,
    updateProduct,
} from '../controllers/product.controller.js';
const router = express.Router();

router.route('/').get(getAllProducts).post(addProduct);

router.route('/:id').patch(updateProduct).delete(deleteProduct);

export default router;
