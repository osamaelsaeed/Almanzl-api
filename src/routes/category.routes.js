import express from 'express';
import { getAllCategories } from '../controllers/category.controller.js';
const router = express.Router();

router.route('/').get(getAllCategories);
export default router;
