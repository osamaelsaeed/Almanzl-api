import { Router } from 'express';
import { signup, login, forgotPassword, resetPassword } from '../controllers/auth.controller.js';
import signupSchema from '../utils/signup.validator.js';
import ajvMiddleware from '../middlewares/ajv.middleware.js';

const router = Router();

router.post('/signup', ajvMiddleware(signupSchema), signup);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

export default router;
