import { Router } from 'express';
import { 
    createCollection, 
    getUserCollections, 
    getCollectionById,  
    deleteCollection,
    addRecipeToCollection,
    removeRecipeFromCollection 
} from '../controllers/collection.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/', authenticate, createCollection);
router.get('/', authenticate, getUserCollections);

router.get('/:id', getCollectionById);
router.delete('/:id', authenticate, deleteCollection);
router.post('/:collectionId/recipes/:recipeId', authenticate, addRecipeToCollection);
router.delete('/:collectionId/recipes/:recipeId', authenticate, removeRecipeFromCollection);

export default router;