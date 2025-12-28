import { Router } from 'express';
import { 
    createCollection, 
    getUserCollections, 
    getCollectionById, 
    updateCollection, 
    deleteCollection,
    addRecipeToCollection,
    removeRecipeFromCollection 
} from '../controllers/collection.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Protected routes
router.post('/', authenticate, createCollection);
router.get('/', authenticate, getUserCollections);
router.get('/user/:userId', getUserCollections);
router.get('/:id', getCollectionById);
router.put('/:id', authenticate, updateCollection);
router.delete('/:id', authenticate, deleteCollection);
router.post('/:collectionId/recipes/:recipeId', authenticate, addRecipeToCollection);
router.delete('/:collectionId/recipes/:recipeId', authenticate, removeRecipeFromCollection);

export default router;