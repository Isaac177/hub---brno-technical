import express from 'express';
import { 
    createPost,
    updatePost,
    deletePost,
    getAllPosts,
    getPostsByType,
    getPostById,
    getPostBySlug,
    togglePostLike,
    getBlogStats
} from '../controllers/postController';

const router = express.Router();

// Get routes - order matters!
router.get('/posts/stats', getBlogStats);  // Stats route must come before :id route
router.get('/posts', getAllPosts);
router.get('/posts/type/:type', getPostsByType);
router.get('/posts/slug/:slug', getPostBySlug);
router.get('/posts/:id', getPostById);

// Other routes
router.post('/posts', createPost);
router.post('/posts/:postId/like', togglePostLike);
router.put('/posts/:id', updatePost);
router.delete('/posts/:id', deletePost);

export default router;
