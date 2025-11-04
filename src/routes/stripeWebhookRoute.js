import express from 'express';
import stripe from '../config/stripe.js';
import Order from '../models/order.model.js';
import User from '../models/user.model.js';

const router = express.Router();

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];

    try {
        const event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;

            const orderId = session.metadata?.orderId;
            const userId = session.metadata?.userId;

            if (orderId) {
                await Order.findByIdAndUpdate(orderId, {
                    isPaid: true,
                    paidAt: new Date(),
                    status: 'confirmed',
                });
                await User.findByIdAndUpdate(userId, {
                    cart: [],
                });
            }
        }

        res.json({ received: true });
    } catch (err) {
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
});

export default router;
