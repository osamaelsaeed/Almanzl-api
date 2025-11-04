import { Router } from 'express';
import {
    addProductToFavorites,
    removeProductFromFavorites,
} from '../controllers/user.controller.js';
import { protect } from '../controllers/auth.controller.js';
const router = Router();

router.use(protect);

router.post('/favorites/:productId', addProductToFavorites);
router.delete('/favorites/:productId', removeProductFromFavorites);

export default router;
