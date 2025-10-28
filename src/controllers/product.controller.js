import asyncHandler from 'express-async-handler';
import { SUCCESS, FAIL } from './../utils/reposnseStatus.js';
import Product from '../models/product.model.js';
import { getProductById } from '../utils/helpers/productHelper.js';

export const getAllProducts = asyncHandler(async (req, res, next) => {
    const allProducts = await Product.find();

    res.status(200).json({
        status: SUCCESS,
        msg: 'Products retrived successfully!',
        results: allProducts?.length,
        data: {
            allProducts,
        },
    });
});

export const addProduct = asyncHandler(async (req, res, next) => {
    const newProduct = new Product(req.body);
    console.log('newProduct', newProduct);
    await newProduct.save();

    res.status(201).json({
        status: SUCCESS,
        msg: 'Product created successfully!',
        data: {
            newProduct,
        },
    });
});

export const updateProduct = asyncHandler(async (req, res, next) => {
    const params = req.params;

    const product = await getProductById(params?.id, next);
    console.log('product', product);
    const updatedProduct = await Product.findByIdAndUpdate(params?.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        status: SUCCESS,
        msg: 'Product updated successfully!',
        data: {
            updatedProduct,
        },
    });
});

export const deleteProduct = asyncHandler(async (req, res, next) => {
    const params = req.params;
    await Product.findByIdAndDelete(params?.id);

    res.status(204).json({
        status: SUCCESS,
        msg: 'Product deleted successfully!',
        data: {
            undefined,
        },
    });
});
