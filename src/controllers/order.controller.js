import Order from '../models/order.model.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { SUCCESS } from '../utils/reposnseStatus.js';
import stripe from '../config/stripe.js';
import { CLIENT_URL } from '../config/config.js';

export const getAllOrders = asyncHandler(async (req, res) => {
    const user = req.user;
    const orders = await Order.find({ userId: user._id });
    return res.status(200).json({
        status: SUCCESS,
        message: 'orders retrived successfully',
        data: orders,
    });
});
export const createOrderWithStripe = asyncHandler(async (req, res) => {
    const userId = '6900f34e8767bc2b572d6efe';
    const { orderItems, shippingAddress, itemsPrice, shippingPrice, discountAmount } = req.body;
    if (!orderItems || orderItems.length === 0) {
        throw new AppError('No order items provided', 400);
    }
    const totalPrice = Math.max(itemsPrice + shippingPrice - (discountAmount || 0), 0);

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: orderItems.map((item) => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
        })),
        success_url: `${CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${CLIENT_URL}/payment-cancel`,
    });

    const order = await Order.create({
        userId,
        orderItems: orderItems.map((item) => ({
            product: item.productId,
            quantity: item.quantity,
        })),
        shippingAddress,
        itemsPrice,
        shippingPrice,
        discountAmount,
        totalPrice,
        payementMethod: 'stripe',
        isPaid: false,
        status: 'pending',
    });
    await stripe.checkout.sessions.update(session.id, {
        metadata: { orderId: order._id.toString(), userId },
    });
    res.status(201).json({
        success: true,
        url: session.url,
        orderId: order._id,
    });
});
