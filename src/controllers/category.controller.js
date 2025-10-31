import Category from '../models/category.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { SUCCESS, ERROR } from '../utils/reposnseStatus.js';

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
export const createCategory = asyncHandler(async (req, res) => {
    const { name, description, icon } = req.body;
    if (!name) {
        return res.status(400).json({
            success: ERROR,
            message: 'Category name is required',
        });
    }

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
        return res.status(400).json({
            success: ERROR,
            message: 'Category already exists',
        });
    }

    const category = await Category.create({
        name,
        description,
        icon,
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
