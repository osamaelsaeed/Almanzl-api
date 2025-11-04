import { asyncHandler } from '../utils/asyncHandler.js';
import jwt from 'jsonwebtoken';
import AppError from '../utils/AppError.js';
import User from '../models/user.model.js';

export const protect = asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers;
    let token;

    if (authorization && authorization.startsWith('Bearer')) {
        token = authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('You are not logged in! Please log in to get access', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
        return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    req.user = user;
    req.id = user._id;
    next();
});

export const isAdmin = asyncHandler(async (req, res, next) => {
    if (!req.user.isAdmin) {
        return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
});
