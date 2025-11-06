import express from 'express';
import { categoryController } from '../controllers/categoryController';

const router = express.Router();

router.get('/category', categoryController.getAll);
router.get('/category/:slug', categoryController.getBySlug);

router.post('/category', categoryController.create);
router.put('/category/:id', categoryController.update);
router.delete('/category/:id', categoryController.delete);

export default router;
