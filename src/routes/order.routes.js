import express from 'express';
import { getAllProducts } from '../controllers/product.controller';
import { authMiddleWare } from '../middlewares/authMiddleware';
const router = express.Router();

router.route('/').get(authMiddleWare, getAllProducts);
