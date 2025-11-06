import { Router } from 'express';
import { getProgress, updateProgress } from '../controllers/progressController';

const router = Router();

router.get('/course-progress/:courseId', getProgress);

// Add specific endpoints for video and quiz progress
router.post('/progress/video', updateProgress);
router.post('/progress/quiz', updateProgress);

// Keep the generic update endpoint for backward compatibility
router.post('/progress/update', updateProgress);

export default router;