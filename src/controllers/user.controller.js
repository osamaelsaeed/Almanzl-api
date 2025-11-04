import mongoose from 'mongoose';
import Product from '../models/product.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { FAIL, SUCCESS } from '../utils/reposnseStatus.js';

export const removeProductFromFavorites = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const user = req.user;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
            status: FAIL,
            message: 'Invalid product ID format',
        });
    }

    const updatedFavorites = user.favorites.filter(
        (product) => product._id.toString() !== productId
    );

    if (updatedFavorites.length === user.favorites.length) {
        return res.status(404).json({
            status: FAIL,
            message: 'Product not found in favorites',
        });
    }

    user.favorites = updatedFavorites;
    await user.save();

    return res.status(200).json({
        status: SUCCESS,
        message: 'Product removed from favorites successfully',
        data: user.favorites,
    });
});

export const addProductToFavorites = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const user = req.user;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
            status: FAIL,
            message: 'Invalid product ID format',
        });
    }

    const productExists = await Product.exists({ _id: productId });
    if (!productExists) {
        return res.status(404).json({
            status: FAIL,
            message: 'No product found with this ID',
        });
    }

    if (user.favorites.some((product) => product._id.toString() === productId)) {
        return res.status(409).json({
            status: FAIL,
            message: 'Product already in favorites',
        });
    }

    user.favorites.push(productId);
    await user.save();

    return res.status(201).json({
        status: SUCCESS,
        message: 'Product added to favorites successfully',
        data: user.favorites,
    });
});
