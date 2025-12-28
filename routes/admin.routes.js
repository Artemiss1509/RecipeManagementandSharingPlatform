import { Router } from 'express';
import { 
    getAllUsers, 
    toggleUserStatus, 
    deleteUser, 
    deleteRecipeAdmin, 
    deleteReviewAdmin,
    getPlatformStatistics,
    makeAdmin 
} from '../controllers/admin.controller.js';
import { authenticate, isAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate, isAdmin);

router.get('/users', getAllUsers);
router.patch('/users/:userId/status', toggleUserStatus);
router.delete('/users/:userId', deleteUser);
router.delete('/recipes/:recipeId', deleteRecipeAdmin);
router.delete('/reviews/:reviewId', deleteReviewAdmin);
router.get('/statistics', getPlatformStatistics);
router.patch('/users/:userId/make-admin', makeAdmin);

export default router;