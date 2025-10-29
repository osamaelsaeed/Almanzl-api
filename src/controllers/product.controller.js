import asyncHandler from 'express-async-handler';
import Product from '../models/product.model.js';
import * as Factory from '../utils/handlerFactory.js';
import { SUCCESS } from '../utils/reposnseStatus.js';
import ApiFeatures from '../utils/apiFeatures.js';

export const getAllProducts = Factory.getAll(Product);

export const getProduct = Factory.getOne(Product);

export const addProduct = Factory.createOne(Product);

export const updateProduct = Factory.updateOne(Product);

export const deleteProduct = Factory.deleteOne(Product);

export const searchForProduct = asyncHandler(async (req, res, next) => {
    const { query } = req.params;

    const features = new ApiFeatures(Product.find({
        "$or": [
            {
                name: {
                    $regex: query,
                    $options: "i"
                }
            }
        ]
    }), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    
    const finalResult = await features.query;

    res.status(200).json({
        status: SUCCESS,
        msg: 'Search for product result',
        results: finalResult.length,
        data: {
            finalResult
        }
    })
});
