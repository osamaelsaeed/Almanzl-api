import Order from '../models/order.model.js';
import Category from '../models/category.model.js';
import Product from '../models/product.model.js';
import User from '../models/user.model.js';

// @desc   Get overview stats (total revenue, orders, customers)
// @route  GET /api/statistics/overview
// @access Private/Admin
export const getOverview = async (req, res) => {
    try {
        const revenueResult = await Order.aggregate([
            { $match: { isPaid: true } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } },
        ]);

        const totalRevenue = revenueResult[0]?.totalRevenue || 0;

        const totalOrders = await Order.countDocuments();

        const totalCustomers = await User.countDocuments();

        res.status(200).json({
            success: true,
            data: {
                totalRevenue,
                totalOrders,
                totalCustomers,
            },
        });
    } catch (error) {
        console.error('Error fetching overview:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching overview data',
        });
    }
};

// @desc   Get monthly revenue data for charts
// @route  GET /api/statistics/sales-performance
// @access Private/Admin
export const getSalesPerformance = async (req, res) => {
    try {
        // Group paid orders by month & year
        const monthlyRevenue = await Order.aggregate([
            { $match: { isPaid: true } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                    },
                    totalRevenue: { $sum: '$totalPrice' },
                    totalOrders: { $sum: 1 },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);

        // Format response for frontend charts (e.g. { month: 'Jan', revenue: 5000 })
        const months = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ];

        const formattedData = monthlyRevenue.map((item) => ({
            month: `${months[item._id.month - 1]} ${item._id.year}`,
            revenue: item.totalRevenue,
            orders: item.totalOrders,
        }));

        res.status(200).json({
            success: true,
            data: formattedData,
        });
    } catch (error) {
        console.error('Error fetching sales performance:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching sales performance',
        });
    }
};

// @desc   Get top-selling products
// @route  GET /api/statistics/top-products
// @access Private/Admin
export const getTopProducts = async (req, res) => {
    try {
        const topProducts = await Order.aggregate([
            { $match: { isPaid: true } },
            { $unwind: '$orderItems' },
            {
                $group: {
                    _id: '$orderItems.product',
                    totalSold: { $sum: '$orderItems.quantity' },
                },
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productDetails',
                },
            },
            { $unwind: '$productDetails' },
            {
                $project: {
                    _id: 1,
                    totalSold: 1,
                    name: '$productDetails.name',
                    price: '$productDetails.price',
                    image: { $arrayElemAt: ['$productDetails.images.url', 0] },
                },
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 },
        ]);

        res.status(200).json({
            success: true,
            data: topProducts,
        });
    } catch (error) {
        console.error('Error fetching top products:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching top products',
        });
    }
};

// @desc   Get total revenue grouped by product category
// @route  GET /api/statistics/sales-by-category
// @access Private/Admin
export const getSalesByCategory = async (req, res) => {
    try {
        const salesByCategory = await Order.aggregate([
            // Only count paid orders
            { $match: { isPaid: true } },

            // Unwind order items
            { $unwind: '$orderItems' },

            // Lookup product info
            {
                $lookup: {
                    from: 'products',
                    localField: 'orderItems.product',
                    foreignField: '_id',
                    as: 'productDetails',
                },
            },
            { $unwind: '$productDetails' },

            // Lookup category info from product
            {
                $lookup: {
                    from: 'categories',
                    localField: 'productDetails.category',
                    foreignField: '_id',
                    as: 'categoryDetails',
                },
            },
            { $unwind: '$categoryDetails' },

            // Group by category name and sum revenue
            {
                $group: {
                    _id: '$categoryDetails.name',
                    totalRevenue: {
                        $sum: {
                            $multiply: ['$orderItems.quantity', '$productDetails.price'],
                        },
                    },
                },
            },
            { $sort: { totalRevenue: -1 } },
        ]);

        // Format response
        const formatted = salesByCategory.map((cat) => ({
            category: cat._id,
            revenue: cat.totalRevenue,
        }));

        res.status(200).json({
            success: true,
            data: formatted,
        });
    } catch (error) {
        console.error('Error fetching sales by category:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching sales by category',
        });
    }
};

// @desc   Get total revenue grouped by Egyptian governorates
// @route  GET /api/statistics/sales-by-governorate
// @access Private/Admin
export const getSalesByGovernorate = async (req, res) => {
    try {
        const salesByGovernorate = await Order.aggregate([
            // Only paid orders
            { $match: { isPaid: true } },

            // Group by shipping city/governorate and sum totalPrice
            {
                $group: {
                    _id: '$shippingAddress.city',
                    totalRevenue: { $sum: '$totalPrice' },
                    totalOrders: { $sum: 1 },
                },
            },
            { $sort: { totalRevenue: -1 } },
        ]);

        const formatted = salesByGovernorate.map((item) => ({
            governorate: item._id || 'Unknown',
            revenue: item.totalRevenue,
            orders: item.totalOrders,
        }));

        res.status(200).json({
            success: true,
            data: formatted,
        });
    } catch (error) {
        console.error('Error fetching sales by governorate:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching sales by governorate',
        });
    }
};

// @desc   Get order counts by status
// @route  GET /api/statistics/orders-status
// @access Private/Admin
export const getOrderStatusCounts = async (req, res) => {
    try {
        const statusCounts = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);

        const defaultStatuses = ['pending', 'confirmed', 'cancelled'];
        const formatted = defaultStatuses.map((status) => ({
            status,
            count: statusCounts.find((s) => s._id === status)?.count || 0,
        }));

        res.status(200).json({
            success: true,
            data: formatted,
        });
    } catch (error) {
        console.error('Error fetching order status counts:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching order status counts',
        });
    }
};
