import express from 'express';
import {
    getOverview,
    getSalesPerformance,
    getTopProducts,
    getSalesByCategory,
    getSalesByGovernorate,
    getOrderStatusCounts,
} from '../controllers/statistics.controller.js';

const router = express.Router();

router.get('/overview', getOverview);
router.get('/sales-performance', getSalesPerformance);
router.get('/top-products', getTopProducts);
router.get('/sales-by-category', getSalesByCategory);
router.get('/sales-by-governorate', getSalesByGovernorate);
router.get('/orders-status', getOrderStatusCounts);

export default router;
