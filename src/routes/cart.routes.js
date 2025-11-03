import express from 'express';
import { protect } from '../middlewares/protect.middleware.js';
import User from '../models/user.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
    const user = await User.findById(req.user.id);
    res.json({ cart: user.cart || [] });
});

router.post(
    '/',
    protect,
    asyncHandler(async (req, res) => {
        const { cart } = req.body;
        const user = await User.findById(req.user.id);
        user.cart = cart;
        await user.save();
        res.status(201).json({ success: true });
    })
);

export default router;
