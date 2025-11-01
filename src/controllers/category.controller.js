import Category from '../models/category.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { SUCCESS, ERROR } from '../utils/reposnseStatus.js';
import { v2 as cloudinaryV2 } from 'cloudinary';
import AppError from '../utils/AppError.js';
// @desc   Get all categories
// @route  GET /api/categories
// @access Public
export const getAllCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json({
        success: SUCCESS,
        message: 'categories retrived successuffully',
        count: categories.length,
        data: categories,
    });
});

// @desc   Get category by ID
// @route  GET /api/categories/:id
// @access Public
export const getCategoryById = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        return res.status(404).json({
            success: ERROR,
            message: 'Category not found',
        });
    }

    res.status(200).json({
        success: SUCCESS,
        data: category,
    });
});

// @desc   Create a new category
// @route  POST /api/categories
// @access Private/Admin
export const createCategory = asyncHandler(async (req, res, next) => {
    const { name, description } = req.body;

    if (!name) {
        return next(new AppError('Category name is required', 400));
    }
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
        return next(new AppError('Category already exists', 400));
    }

    let iconData = null;

    if (req.file) {
        const result = await cloudinaryV2.uploader.upload(req.file.path, {
            folder: 'categories/icons',
            transformation: [{ width: 200, height: 200, crop: 'fill' }],
        });

        iconData = {
            url: result.secure_url,
            public_id: result.public_id,
        };
    } else {
        return next(new AppError('Category icon is required', 400));
    }

    const category = await Category.create({
        name,
        description,
        icon: iconData,
    });

    res.status(201).json({
        success: SUCCESS,
        message: 'Category created successfully',
        data: category,
    });
});

// @desc   Update category by ID
// @route  PUT /api/categories/:id
// @access Private/Admin
export const updateCategory = asyncHandler(async (req, res) => {
    const { name, description, icon } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
        return res.status(404).json({
            success: ERROR,
            message: 'Category not found',
        });
    }

    if (name) category.name = name;
    if (description) category.description = description;
    if (icon) category.icon = icon;

    const updatedCategory = await category.save();

    res.status(200).json({
        success: SUCCESS,
        message: 'Category updated successfully',
        data: updatedCategory,
    });
});

// @desc   Delete category by ID
// @route  DELETE /api/categories/:id
// @access Private/Admin
export const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        return res.status(404).json({
            success: ERROR,
            message: 'Category not found',
        });
    }

    await category.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Category deleted successfully',
    });
});
