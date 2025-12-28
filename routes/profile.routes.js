import { Router } from 'express';
import { 
    getUserProfile, 
    getCurrentUserProfile, 
    updateUserProfile, 
    changePassword,
    deleteAccount 
} from '../controllers/profile.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';

const router = Router();

// Public routes
router.get('/:userId', getUserProfile);

// Protected routes
router.get('/me/profile', authenticate, getCurrentUserProfile);
router.put('/me/profile', authenticate, upload.single('profileImage'), updateUserProfile);
router.put('/me/password', authenticate, changePassword);
router.delete('/me/account', authenticate, deleteAccount);

export default router;