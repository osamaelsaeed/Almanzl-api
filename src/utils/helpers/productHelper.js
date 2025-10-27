import { FAIL } from './../reposnseStatus.js';
import Product from '../../models/product.model.js';
import AppError from '../AppError.js';
export const getProductById = async (id, next) => {
    const product = await Product.findById(id);

    if (!product) {
        throw new AppError('No such Product', 404);
    }

    return product;
};
