import express from 'express';
import {
    addProduct,
    deleteProduct,
    getAllProducts,
    getProduct,
    searchForProduct,
    updateProduct,
} from '../controllers/product.controller.js';
import { upload } from '../middlewares/upload.js';
const router = express.Router();

router.route('/')
    .get(getAllProducts)
    .post(upload.array('images', 8), addProduct);

router.route('/:id')
    .get(getProduct)
    .patch(upload.array('images', 8), updateProduct)
    .delete(deleteProduct);

router.route('/search/:query')
    .get(searchForProduct);

export default router;
