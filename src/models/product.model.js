import mongoose from 'mongoose';
import validator from 'validator';

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Product name is required!'],
            maxlength: [30, "Product name is too long it musn't exceed 30 characters"],
            minlength: [3, 'Product name is too short it must be >= 3 characters'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Product description is required!'],
            maxlength: [300, "Product description is too long it musn't exceed 300 characters"],
            minlength: [5, 'Product description is too short it must be >= 5 characters'],
            trim: true,
        },
        price: {
            type: Number,
            required: [true, 'Product price is required!'],
            min: [0, 'Product price must be a +ve number'],
            max: [1_000_000, 'Product price is so high'],
        },
        images: [
            {
                public_id: {
                    type: String,
                    required: true
                },
                url: {
                    type: String,
                    required: true
                }
            }
        ],
        stock: {
            type: Number,
            required: [true, 'Product stock is required!'],
            min: [0, 'Stock cannot be negative'],
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const Product = mongoose.model('Product', productSchema);

export default Product;
