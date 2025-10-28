import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { checkEmail, checkPhoneNumber, checkPassword } from '../utils/regexExpressions.js';

const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: checkEmail,
    },
    phone: {
        type: String,
        required: true,
        match: checkPhoneNumber,
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        match: checkPassword,
    },
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.correctPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
