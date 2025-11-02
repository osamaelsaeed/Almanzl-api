import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    icon: {
        type: String,
    },
});

const Category = mongoose.model('Category', categorySchema);
export default Category;
