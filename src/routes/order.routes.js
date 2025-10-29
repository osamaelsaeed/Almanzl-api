import express from 'express';
import { getAllOrders, createOrderWithStripe } from '../controllers/order.controller.js';
const router = express.Router();

router.route('/').get(getAllOrders);
router.route('/create-checkout-session').post(createOrderWithStripe);

export default router;
