import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { findUserByEmail } from '../utils/findUserByEmail';
import slugify from 'slugify';
import { validateUserPermission } from '../utils/validateUserPermission';

const prisma = new PrismaClient();


export const categoryController = {
  async create(req: Request, res: Response) {
    try {
      const { name, description } = req.body;
      const userEmail = req.headers['user-email'] as string;

      const user = await findUserByEmail(userEmail);

      if (!user || !validateUserPermission(user.role)) {
        return res.status(403).json({ error: 'Unauthorized to create categories' });
      }

      const slug = slugify(name, { lower: true });

      const category = await prisma.category.create({
        data: {
          name,
          description,
          slug,
        },
      });

      res.status(201).json(category);
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Category with this name already exists' });
      }
      res.status(500).json({ error: 'Failed to create category' });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const categories = await prisma.category.findMany({
        include: {
          _count: {
            select: {
              posts: true
            }
          }
        }
      });
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  },

  async getBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const category = await prisma.category.findUnique({
        where: { slug },
        include: {
          posts: {
            where: { status: 'PUBLISHED' },
            orderBy: { publishedAt: 'desc' },
            take: 10
          },
          _count: {
            select: {
              posts: true
            }
          }
        }
      });

      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      res.json(category);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch category' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      const userEmail = req.headers['user-email'] as string;

      const user = await findUserByEmail(userEmail);

      if (!user || !validateUserPermission(user.role)) {
        return res.status(403).json({ error: 'Unauthorized to update categories' });
      }

      const slug = name ? slugify(name, { lower: true }) : undefined;

      const category = await prisma.category.update({
        where: { id },
        data: {
          name,
          description,
          slug,
        },
      });

      res.json(category);
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.status(500).json({ error: 'Failed to update category' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userEmail = req.headers['user-email'] as string;

      const user = await findUserByEmail(userEmail);

      if (!user || !validateUserPermission(user.role)) {
        return res.status(403).json({ error: 'Unauthorized to delete categories' });
      }

      await prisma.category.delete({
        where: { id },
      });

      res.status(204).send();
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.status(500).json({ error: 'Failed to delete category' });
    }
  },
};
