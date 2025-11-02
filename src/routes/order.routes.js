import express from 'express';
import { getAllOrders, createOrderWithStripe } from '../controllers/order.controller.js';
import { protect } from '../middlewares/protect.middleware.js';
const router = express.Router();

router.route('/').get(protect, getAllOrders);
router.route('/create-checkout-session').post(protect, createOrderWithStripe);

export default router;
