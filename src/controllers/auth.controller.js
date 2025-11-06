import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import AppError from '../utils/AppError.js';
import { sendEmail } from '../utils/email.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { CLIENT_URL } from '../config/config.js';

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
        provider: 'local',
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

export const forgotPassword = asyncHandler(async (req, res, next) => {
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

    const resetURL = `${CLIENT_URL}/resetPassword/${resetToken}`;

    const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9; padding: 30px;">
      <div style="max-width: 500px; background-color: #ffffff; margin: auto; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background-color: #232f3e; color: white; text-align: center; padding: 20px;">
          <h2 style="margin: 0;">Password Reset Request</h2>
        </div>
        <div style="padding: 25px; color: #333;">
          <p style="font-size: 16px;">Hi ${user.name || 'there'},</p>
          <p style="font-size: 15px;">We received a request to reset your password. You can set a new password by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetURL}" style="background-color: #232f3e; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 14px; color: #666;">
            This link will expire in 10 minutes. If you did not request a password reset, please ignore this email.
          </p>
          <p style="margin-top: 25px; font-size: 13px; color: #999;">
            Thanks,<br>The Support Team
          </p>
        </div>
      </div>
      <p style="text-align: center; font-size: 12px; color: #aaa; margin-top: 20px;">
        © ${new Date().getFullYear()} almanzl. All rights reserved.
      </p>
    </div>
  `;

    try {
        await sendEmail({
            to: user.email,
            subject: 'Your password reset link (valid for 10 minutes)',
            text: `Reset your password: ${resetURL}`,
            html,
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
export const resetPassword = asyncHandler(async (req, res, next) => {
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
