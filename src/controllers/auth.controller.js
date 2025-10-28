import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

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
export const signup = catchAsync(async (req, res, next) => {
    const user = await User.create({
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        password: req.body.password,
    });
    sendUserWithToken(user, 201, req, res);
});

// Login controller
export const login = catchAsync(async (req, res, next) => {
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
export const protect = catchAsync(async (req, res, next) => {
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
