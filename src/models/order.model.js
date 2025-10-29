import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
        },
        payementMethod: {
            type: String,
            required: true,
            enum: ['cash', 'stripe'],
            default: cash,
        },
        orderItems: [
            {
                product: {
                    type: mongoose.Schema.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    default: 1,
                },
                subprice: { type: Number, required: true },
            },
        ],
        shippingAddress: {
            fullName: { type: String, required: true },
            address: { type: String, required: true },
            city: { type: String, required: true },
            postalCode: { type: String },
            country: { type: String, required: true },
            phoneNumber: { type: String, required: true },
        },
        itemsPrice: { type: Number, required: true },
        shippingPrice: { type: Number, required: true },
        discountAmount: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalPrice: {
            type: Number,
            required: true,
        },
        isPaid: { type: Boolean, default: false },
        paidAt: { type: Date },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'cancelled'],
            default: 'pending',
        },
    },
    {
        timestamps: true,
    }
);
orderSchema.pre('save', function (next) {
    if (this.isModified('itemsPrice') || this.isModified('discountAmount')) {
        const subtotal = this.itemsPrice + this.shippingPrice;
        this.totalPrice = Math.max(subtotal - this.discountAmount, 0);
    }
    next();
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
