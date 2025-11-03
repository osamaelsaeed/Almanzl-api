import asyncHandler from 'express-async-handler';
import Product from '../models/product.model.js';
import * as factory from '../utils/handlerFactory.js';
import { FAIL, SUCCESS } from '../utils/reposnseStatus.js';

export const getAllProducts = factory.getAll(Product);

export const getProduct = factory.getOne(Product);

export const addProduct = factory.createOneWithImages(Product);

export const updateProduct = factory.updateOne(Product);

export const deleteProduct = factory.deleteOne(Product);

export const getSimilarProducts = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
        return res.status(404).json({
            status: FAIL,
            message: 'Product not found',
        });
    }

    const similarProducts = await Product.find({
        category: product.category,
        _id: { $ne: id },
    })
        .limit(8)
        .populate('category', 'name');

    res.status(200).json({
        status: SUCCESS,
        message: 'Similar products fetched successfully',
        results: similarProducts.length,
        data: similarProducts,
    });
});
