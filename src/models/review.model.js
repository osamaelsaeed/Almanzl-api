import mongoose from 'mongoose';
import Product from './product.model.js';
const { Schema } = mongoose;

const reviewSchema = new Schema(
    {
        rating: {
            type: Number,
            required: [true, 'Review must have a rate'],
            min: [0, "Product Rate can't be lower than 0"],
            max: [5, "Product Rate can't be greater than 5"],
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        review: {
            type: String,
            required: [true, 'Review must have a review'],
        },
        product: {
            type: mongoose.Schema.ObjectId,
            required: [true, 'Review must belong to a Product.'],
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Review must belong to a User.'],
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name photo',
    });
    next();
});

reviewSchema.statics.calcAverageRatings = async function (productId) {
    const stats = await this.aggregate([
        {
            $match: { product: productId },
        },
        {
            $group: {
                _id: '$product',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' },
            },
        },
    ]);

    if (stats.length > 0) {
        await Product.findByIdAndUpdate(productId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating,
        });
    } else {
        await Product.findByIdAndUpdate(productId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5,
        });
    }
};

reviewSchema.post('save', function () {
    this.constructor.calcAverageRatings(this.product);
});

reviewSchema.post(/^findOneAnd/, async function (doc) {
    if (doc) {
        await doc.constructor.calcAverageRatings(doc.product);
    }
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
