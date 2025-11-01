import { Router } from 'express';
import {
    signup,
    login,
    getAllUsers,
    deleteUser,
    getUserProfile,
} from '../controllers/auth.controller.js';
import { protect } from '../middlewares/protect.middleware.js';
import signupSchema from '../utils/signup.validator.js';
import ajvMiddleware from '../middlewares/ajv.middleware.js';

const router = Router();

router.post('/signup', ajvMiddleware(signupSchema), signup);
router.post('/login', login);

router.route('/get-all-users').get(getAllUsers);
router.route('/:id').delete(deleteUser).get(getUserProfile);

export default router;
