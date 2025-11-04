import { Router } from 'express';
import {
    signup,
    login,
    forgotPassword,
    resetPassword,
    getAllUsers,
    deleteUser,
    getUserProfile,
} from '../controllers/auth.controller.js';
import signupSchema from '../utils/signup.validator.js';
import ajvMiddleware from '../middlewares/ajv.middleware.js';
import { isAdmin, protect } from '../middlewares/protect.middleware.js';
const router = Router();

router.post('/signup', ajvMiddleware(signupSchema), signup);
router.post('/login', login);

router.route('/get-all-users').get(protect, isAdmin, getAllUsers);
router.route('/:id').delete(protect, isAdmin, deleteUser).get(getUserProfile);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

export default router;
