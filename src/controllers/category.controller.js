import Category from '../models/category.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { SUCCESS } from '../utils/reposnseStatus.js';

export const getAllCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({});
    res.status(200).json({
        success: SUCCESS,
        message: 'categories retrived successuffully',
        data: categories,
    });
});
