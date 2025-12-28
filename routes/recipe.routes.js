import { Router } from 'express';
import { 
    createRecipe, 
    getAllRecipes, 
    getRecipeById, 
    updateRecipe, 
    deleteRecipe,
    getUserRecipes 
} from '../controllers/recipe.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';

const router = Router();

// Public routes
router.get('/', getAllRecipes);
router.get('/:id', getRecipeById);
router.get('/user/:userId', getUserRecipes);

// Protected routes
router.post('/', authenticate, upload.single('image'), createRecipe);
router.put('/:id', authenticate, upload.single('image'), updateRecipe);
router.delete('/:id', authenticate, deleteRecipe);

export default router;