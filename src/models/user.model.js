import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { checkEmail, checkPhoneNumber, checkPassword } from '../utils/regexExpressions.js';

const { Schema } = mongoose;

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            match: checkEmail,
            lowercase: true,
        },
        phone: {
            type: String,
            required: false,
            match: checkPhoneNumber,
        },
        password: {
            type: String,
            required: true,
            minlength: 8,
            match: checkPassword,
            select: false,
        },
        address: {
            type: String,
        },
        city: { type: String },
        postalCode: { type: String },
        country: { type: String },
        cart: [
            {
                productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
                name: String,
                price: Number,
                image: String,
                quantity: Number,
            },
        ],
        favorites: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
            },
        ],

        passwordResetToken: String,
        passwordResetExpires: Date,

        provider: { type: String, enum: ['local', 'google', 'github'], default: 'local' },
        providerId: { type: String },
        avatar: { type: String },
        isAdmin: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.pre(/^find/, function (next) {
    this.populate('favorites');
    next();
});

userSchema.methods.correctPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.createPasswordResetToken = function () {
    const rawToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return rawToken;
};
const User = mongoose.model('User', userSchema);

export default User;
