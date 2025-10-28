import express from 'express';
import {
    addProduct,
    deleteProduct,
    getAllProducts,
    getProduct,
    searchForProduct,
    updateProduct,
} from '../controllers/product.controller.js';
const router = express.Router();

router.route('/')
    .get(getAllProducts)
    .post(addProduct);

router.route('/:id')
    .get(getProduct)
    .patch(updateProduct)
    .delete(deleteProduct);

router.route('/search/:query')
    .get(searchForProduct);

export default router;
