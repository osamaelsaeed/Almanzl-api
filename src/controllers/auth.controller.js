import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

const sendUserWithToken = (user, statusCode, req, res) => {
    const token = signToken(user._id);
    user.password = undefined;
    res.status(statusCode).json({ status: 'success', data: { ...user._doc, token } });
};

// Signup controller
export const signup = asyncHandler(async (req, res, next) => {
    const user = await User.create({
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        password: req.body.password,
    });
    sendUserWithToken(user, 201, req, res);
});

// Login controller
export const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new AppError('You should provide bothe email and password', 400));
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password))) {
        return next(new AppError('Invalid email or password', 401));
    }

    sendUserWithToken(user, 200, req, res);
});

//forget password controller

//restpassword controller

// Protect middleware
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

// @desc    Get all users (Admin only, paginated)
// @route   GET /api/auth?page=1&limit=10&search=keyword
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || '';

    const query = search
        ? {
              $or: [
                  { name: { $regex: search, $options: 'i' } },
                  { email: { $regex: search, $options: 'i' } },
                  { phone: { $regex: search, $options: 'i' } },
              ],
          }
        : {};

    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    res.status(200).json({
        success: true,
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        count: users.length,
        users,
    });
});

// @desc    Delete a user (Admin only)
// @route   DELETE /api/auth/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        throw new AppError('User not found', 404);
    }

    await user.deleteOne();

    res.status(200).json({
        success: true,
        message: 'User deleted successfully',
    });
});

// @desc    Get logged-in user/admin profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
        throw new AppError('User not found', 404);
    }

    res.status(200).json({
        success: true,
        user,
    });
});
