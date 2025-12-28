import { Router } from 'express';
import { 
    followUser, 
    unfollowUser, 
    getFollowers, 
    getFollowing,
    checkFollowing,
    getActivityFeed 
} from '../controllers/follow.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/:userId', authenticate, followUser);
router.delete('/:userId', authenticate, unfollowUser);
router.get('/:userId/followers', getFollowers);
router.get('/:userId/following', getFollowing);
router.get('/check/:userId', authenticate, checkFollowing);
router.get('/feed/activity', authenticate, getActivityFeed);

export default router;