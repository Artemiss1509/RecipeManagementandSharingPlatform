import { Router } from 'express';
import { rateRecipe, getUserRating, deleteRating } from '../controllers/rating.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/:recipeId', authenticate, rateRecipe);
router.get('/:recipeId', authenticate, getUserRating);
router.delete('/:recipeId', authenticate, deleteRating);

export default router;