import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import { sendEmail } from '../utils/email.js';

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
        provider: 'local',
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

export const forgotPassword = catchAsync(async (req, res, next) => {
    const { email } = req.body;
    if (!email) return next(new AppError('Please provide your email', 400));

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(200).json({
            status: 'success',
            message: 'If that email is registered, a reset link has been sent.',
        });
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get('host')}/api/auth/resetPassword/${resetToken}`;

    const message = `
    <p>Hi ${user.name || 'Dear User'},</p>
    <p>You requested a password reset. Click the link below within 10 minutes:</p>
    <p><a href="${resetURL}" target="_blank">${resetURL}</a></p>
    <p>If you did not request this, please ignore this email.</p>
  `;

    try {
        await sendEmail({
            to: user.email,
            subject: 'Your password reset link (valid for 10 minutes)',
            text: `Reset your password: ${resetURL}`,
            message,
        });

        res.status(200).json({
            status: 'success',
            message: 'If that email is registered, a reset link has been sent.',
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new AppError('There was an error sending the email. Try again later.', 500));
    }
});

//restpassword controller
export const resetPassword = catchAsync(async (req, res, next) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) return next(new AppError('Token is required', 400));
    if (!password) return next(new AppError('New password is required', 400));

    const hashed = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashed,
        passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) return next(new AppError('Token is invalid or has expired', 400));

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    sendUserWithToken(user, 200, req, res);
});
