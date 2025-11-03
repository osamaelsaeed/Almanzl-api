import express from 'express';
import {
    getAllOrders,
    createOrderWithStripe,
    getAllOrdersPaginated,
    getOrderById,
    updateOrderStatus,
    deleteOrder,
    createOrder,
    updateOrderPaidStatus,
    createOrderWithCash,
    retriveStripeSession,
} from '../controllers/order.controller.js';
import { protect } from '../middlewares/protect.middleware.js';
const router = express.Router();
router.route('/').get(protect, getAllOrders).post(protect, createOrder);
router.route('/create-checkout-session').post(protect, createOrderWithStripe);
router.route('/create-order-cash').post(protect, createOrderWithCash);
router.route('/session/:id').get(protect, retriveStripeSession);
router.route('/get-paginated-orders').get(getAllOrdersPaginated);
router.route('/:id').get(getOrderById);
router.put('/:id/status', updateOrderStatus);
router.put('/:id/pay', updateOrderPaidStatus);
router.delete('/:id', deleteOrder);
export default router;
