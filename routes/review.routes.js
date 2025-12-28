import { Router } from 'express';
import { 
    createReview, 
    getRecipeReviews, 
    updateReview, 
    deleteReview,
    getUserReviews 
} from '../controllers/review.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.get('/recipe/:recipeId', getRecipeReviews);
router.get('/user/:userId', getUserReviews);

// Protected routes
router.post('/:recipeId', authenticate, createReview);
router.put('/:id', authenticate, updateReview);
router.delete('/:id', authenticate, deleteReview);

export default router;