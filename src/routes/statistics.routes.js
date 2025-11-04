import express from 'express';
import {
    getOverview,
    getSalesPerformance,
    getTopProducts,
    getSalesByCategory,
    getSalesByGovernorate,
    getOrderStatusCounts,
} from '../controllers/statistics.controller.js';
import { isAdmin, protect } from '../middlewares/protect.middleware.js';

const router = express.Router();

router.get('/overview', protect, isAdmin, getOverview);
router.get('/sales-performance', protect, isAdmin, getSalesPerformance);
router.get('/top-products', protect, isAdmin, getTopProducts);
router.get('/sales-by-category', protect, isAdmin, getSalesByCategory);
router.get('/sales-by-governorate', protect, isAdmin, getSalesByGovernorate);
router.get('/orders-status', protect, isAdmin, getOrderStatusCounts);

export default router;
