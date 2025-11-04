import express from 'express';
import {
    getOverview,
    getSalesPerformance,
    getTopProducts,
    getSalesByCategory,
    getSalesByGovernorate,
    getOrderStatusCounts,
} from '../controllers/statistics.controller.js';
import { protect } from '../middlewares/protect.middleware.js';

const router = express.Router();

router.get('/overview', protect, getOverview);
router.get('/sales-performance', protect, getSalesPerformance);
router.get('/top-products', protect, getTopProducts);
router.get('/sales-by-category', protect, getSalesByCategory);
router.get('/sales-by-governorate', protect, getSalesByGovernorate);
router.get('/orders-status', protect, getOrderStatusCounts);

export default router;
