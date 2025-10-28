import asyncHandler from 'express-async-handler';
import { SUCCESS, FAIL } from './../utils/reposnseStatus.js';
import Product from '../models/product.model.js';
import { getProductById } from '../utils/helpers/productHelper.js';
import AppError from '../utils/AppError.js';

export const getAllProducts = asyncHandler(async (req, res, next) => {
    const allProducts = await Product.find().select('-__v');

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
    const { id } = req.params;
    const product = await getProductById(id, next);

    const allowedFields = ['name', 'description', 'price', 'image', 'stock'];
    Object.keys(req.body).forEach(key => {
        if(!allowedFields.includes(key))
            delete req.body[key];
    })

    Object.assign(product, req.body);
    console.log('after assigning', product);
    await product.save();

    res.status(200).json({
        status: SUCCESS,
        msg: 'Product updated successfully!',
        data: {
            product,
        },
    });
});

export const deleteProduct = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);

    if(!deletedProduct) {
        const err = new AppError('No such product', 404);
        return next(err);
    }


    res.status(204).json({
        status: SUCCESS,
        msg: 'Product deleted successfully!',
    });
});
