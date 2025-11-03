import { asyncHandler } from '../utils/asyncHandler.js';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import AppError from '../utils/AppError.js';

export const protect = asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers;
    let token;
    if (authorization && authorization.startsWith('Bearer')) {
        token = authorization.split(' ')[1];
    }

    const notLoggedInError = new AppError(
        'You are not logged in! please log in to get access',
        401
    );
    if (!token) {
        return next(notLoggedInError);
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
        return next(notLoggedInError);
    }
    req.user = user;
    req.id = user._id;
    next();
});
