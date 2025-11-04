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
    const userId = req.id;
    const { orderItems, shippingAddress, itemsPrice, shippingPrice, discountAmount } = req.body;
    if (!orderItems || orderItems.length === 0) {
        throw new AppError('No order items provided', 400);
    }
    const totalPrice = Math.max(itemsPrice + shippingPrice - (discountAmount || 0), 0);

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
            ...orderItems.map((item) => ({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: Math.round(item.price * 100),
                },
                quantity: item.quantity,
            })),
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Shipping',
                    },
                    unit_amount: Math.round(shippingPrice * 100),
                },
                quantity: 1,
            },
        ],
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
        metadata: { orderId: order._id.toString(), userId: String(userId) },
    });
    res.status(201).json({
        success: true,
        url: session.url,
        orderId: order._id,
    });
});

export const createOrderWithCash = asyncHandler(async (req, res) => {
    const userId = req.id;
    const { orderItems, shippingAddress, itemsPrice, shippingPrice, discountAmount } = req.body;
    if (!orderItems || orderItems.length === 0) {
        throw new AppError('No order items provided', 400);
    }
    const totalPrice = Math.max(itemsPrice + shippingPrice - (discountAmount || 0), 0);

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
        payementMethod: 'cash',
        isPaid: true,
        status: 'confirmed',
    });

    res.status(201).json({
        success: true,
        orderId: order._id,
    });
});

export const retriveStripeSession = asyncHandler(async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(req.params.id);
        res.status(200).json({ status: SUCCESS, message: 'session retrieved', data: session });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});
// @desc   Get all orders paginated (Admin view, paginated)
// @route  GET /api/orders-paginated
// @access Private/Admin
export const getAllOrdersPaginated = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalOrders = await Order.countDocuments();
    const orders = await Order.find()
        .populate('userId', 'name email')
        .populate('orderItems.productId', 'name price')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.status(200).json({
        success: true,
        message: 'Orders fetched successfully',
        page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        data: orders,
    });
});

// @desc   Get specific order by ID
// @route  GET /api/orders/:id
// @access Private (Admin or Order Owner)
export const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('userId', 'name email phone')
        .populate('orderItems.product', 'name price images');

    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found',
        });
    }

    // if (req.user.role !== 'admin' && order.userId.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Not authorized to access this order",
    //   });
    // }

    res.status(200).json({
        success: SUCCESS,
        message: 'Order details fetched successfully',
        data: order,
    });
});

// @desc   Create a new order
// @route  POST /api/orders
// @access Private (Logged-in users)
export const createOrder = asyncHandler(async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        discountAmount,
        totalPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'No order items provided',
        });
    }

    if (!shippingAddress || !shippingAddress.address) {
        return res.status(400).json({
            success: false,
            message: 'Shipping address is required',
        });
    }

    if (!paymentMethod) {
        return res.status(400).json({
            success: false,
            message: 'Payment method is required',
        });
    }

    const order = await Order.create({
        userId: req.user._id,
        orderItems,
        shippingAddress,
        payementMethod: paymentMethod,
        itemsPrice,
        shippingPrice,
        discountAmount: discountAmount || 0,
        totalPrice,
    });

    res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order,
    });
});

// @desc   Update order status (pending, confirmed, cancelled)
// @route  PUT /api/orders/:id/status
// @access Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid status. Allowed values: pending, confirmed, cancelled',
        });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found',
        });
    }

    order.status = status;
    const updatedOrder = await order.save();

    res.status(200).json({
        success: true,
        message: `Order status updated to '${status}'`,
        data: updatedOrder,
    });
});

// @desc    Delete order (admin only)
// @route   DELETE /api/orders/:id
// @access  Admin
export const deleteOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        throw new AppError('Order not found', 404);
    }

    await order.deleteOne();

    res.status(200).json({
        success: SUCCESS,
        message: 'Order deleted successfully',
    });
});

// @desc   Mark an order as paid (Admin only)
// @route  PUT /api/orders/:id/pay
// @access Private/Admin
export const updateOrderPaidStatus = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found',
        });
    }

    // Mark as paid only if not already
    if (order.isPaid) {
        return res.status(400).json({
            success: false,
            message: 'Order is already marked as paid',
        });
    }

    order.isPaid = true;
    order.paidAt = new Date();

    const updatedOrder = await order.save();

    res.status(200).json({
        success: true,
        message: 'Order marked as paid successfully',
        data: updatedOrder,
    });
});
