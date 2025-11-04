import express from 'express';
import {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
} from '../controllers/category.controller.js';
import { isAdmin, protect } from '../middlewares/protect.middleware.js';
import { upload } from '../middlewares/upload.js';
const router = express.Router();

router.route('/').get(getAllCategories);
router.get('/:id', getCategoryById);
router.post('/', protect, isAdmin, upload.single('icon'), createCategory);
router.put('/:id', protect, isAdmin, updateCategory);
router.delete('/:id', protect, isAdmin, deleteCategory);
export default router;
