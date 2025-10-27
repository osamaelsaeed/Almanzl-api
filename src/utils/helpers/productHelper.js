import { FAIL } from './../reposnseStatus.js';
import Product from '../../models/product.model.js';
import AppError from '../AppError.js';
export const getProductById = async (id, next) => {
    const product = await Product.findById(id);

    if (!product) {
        throw new AppError(404, FAIL, 'No such Product');
    }

    return product;
};
