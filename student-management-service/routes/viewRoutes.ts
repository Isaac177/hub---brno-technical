import express from 'express';
import {
    trackView,
    getPostViewStats,
    getTopViewedPosts
} from '../controllers/viewController';

const router = express.Router();

router.post('/posts/:postId/view', trackView);
router.get('/posts/:postId/view-stats', getPostViewStats);
router.get('/posts/top-viewed', getTopViewedPosts);

export default router;
