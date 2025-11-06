import { Router } from 'express';
import { 
    createComment, 
    updateComment, 
    deleteComment, 
    getCommentsByPost, 
    getReplies, 
    toggleLike,
    getAllComments,
    blockComment
} from '../controllers/commentController';

const router = Router();

// Public routes
router.get('/posts/:postId/comments', getCommentsByPost);
router.get('/comments/:commentId/replies', getReplies);

// Protected routes
router.post('/comments', createComment);
router.put('/comments/:id', updateComment);
router.delete('/comments/:id', deleteComment);
router.post('/comments/:id/like', toggleLike);

// Admin routes
router.get('/comments', getAllComments);
router.put('/comments/:id/block', blockComment);

export default router;
