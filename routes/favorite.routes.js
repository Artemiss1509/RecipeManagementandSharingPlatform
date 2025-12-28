import { Router } from 'express';
import { 
    addFavorite, 
    removeFavorite, 
    getUserFavorites,
    checkFavorite 
} from '../controllers/favorite.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/:recipeId', authenticate, addFavorite);
router.delete('/:recipeId', authenticate, removeFavorite);
router.get('/', authenticate, getUserFavorites);
router.get('/check/:recipeId', authenticate, checkFavorite);

export default router;