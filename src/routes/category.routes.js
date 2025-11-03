import express from 'express';
import {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
} from '../controllers/category.controller.js';
import { upload } from '../middlewares/upload.js';
const router = express.Router();

router.route('/').get(getAllCategories);
router.get('/:id', getCategoryById);
router.post('/', upload.single('icon'), createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);
export default router;
