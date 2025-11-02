import express from 'express';
import {
    getAllOrders,
    createOrderWithStripe,
    getAllOrdersPaginated,
    getOrderById,
    updateOrderStatus,
    deleteOrder,
} from '../controllers/order.controller.js';
import { protect } from '../middlewares/protect.middleware.js';
const router = express.Router();

router.route('/').get(protect, getAllOrders);
router.route('/create-checkout-session').post(protect, createOrderWithStripe);
router.route('/get-paginated-orders').get(getAllOrdersPaginated);
router.route('/:id').get(getOrderById);
router.put('/:id/status', updateOrderStatus);
router.delete('/:id', deleteOrder);
export default router;
