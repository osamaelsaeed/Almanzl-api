import Order from '../models/order.model';
import { asyncHandler } from '../utils/asyncHandler';
import { SUCCESS } from '../utils/reposnseStatus';

export const getAllOrders = asyncHandler(async (req, res) => {
    const user = req.user;
    const orders = await Order.find({ userId: user._id });
    return res.status(200).json({
        status: SUCCESS,
        message: 'orders retrived successfully',
        data: orders,
    });
});
export const createOrder = asyncHandler(async (req, res) => {
    const user = req.user;
});
