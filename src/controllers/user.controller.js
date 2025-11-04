import User from '../models/user.model';
import { asyncHandler } from '../utils/asyncHandler';
import { SUCCESS } from '../utils/reposnseStatus';

export const addProductToFavorites = asyncHandler(async (req, res, next) => {
    const { productId } = req.params;

    req.user.favorites.push(productId);
    const user = await User.findOneAndUpdate(req.id, req.user);

    res.status(201).json({
        status: SUCCESS,
        data: user,
    });
});
