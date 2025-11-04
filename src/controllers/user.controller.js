import User from '../models/user.model';
import { asyncHandler } from '../utils/asyncHandler';

export const addProductToFavorite = asyncHandler(async (req, res, next) => {
    const { productId } = req.params;
    const updatedUser = req.user.favorites.push(productId);
    const user = await User.findOneAndUpdate(req.id, updatedUser);
});
