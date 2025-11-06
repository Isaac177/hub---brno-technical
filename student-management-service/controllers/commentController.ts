import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { findUserByEmail } from '../utils/findUserByEmail';

const prisma = new PrismaClient();

interface CommentInput {
    content: string;
    postId: string;
    parentId?: string;
}

interface PaginationParams {
    page?: number;
    limit?: number;
    orderBy?: 'asc' | 'desc';
}

const processPagination = ({ page = 1, limit = 10, orderBy = 'desc' }: PaginationParams) => ({
    take: limit,
    skip: (page - 1) * limit,
    orderBy: { createdAt: orderBy }
});

const commentIncludeQuery = {
    likes: true,
    replies: {
        include: {
            likes: true,
            _count: {
                select: {
                    likes: true,
                    replies: true
                }
            }
        }
    },
    _count: {
        select: {
            likes: true,
            replies: true
        }
    }
};

export const createComment = async (req: Request, res: Response) => {
    try {
        const userEmail = req.headers['user-email'] as string;
        if (!userEmail) return res.status(401).json({ error: 'Authentication required' });

        const { content, postId, parentId }: CommentInput = req.body;

        if (!content || !postId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const userData = await findUserByEmail(userEmail);
        if (!userData) return res.status(404).json({ error: 'User not found' });

        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) return res.status(404).json({ error: 'Post not found' });

        if (parentId) {
            const parentComment = await prisma.comment.findUnique({
                where: { id: parentId }
            });
            if (!parentComment) {
                return res.status(404).json({ error: 'Parent comment not found' });
            }
            if (parentComment.parentId) {
                return res.status(400).json({ error: 'Nested replies are not allowed' });
            }
        }

        const comment = await prisma.comment.create({
            data: {
                content,
                postId,
                parentId,
                userId: userData.id,
                authorName: `${userData.firstName} ${userData.lastName}`
            },
            include: commentIncludeQuery
        });

        res.status(201).json({ data: comment });
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ error: 'Failed to create comment' });
    }
};

export const updateComment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userEmail = req.headers['user-email'] as string;
        if (!userEmail) return res.status(401).json({ error: 'Authentication required' });

        const { content } = req.body;
        if (!content) return res.status(400).json({ error: 'Content is required' });

        const comment = await prisma.comment.findUnique({ where: { id } });
        if (!comment) return res.status(404).json({ error: 'Comment not found' });

        const userData = await findUserByEmail(userEmail);
        if (!userData) return res.status(404).json({ error: 'User not found' });

        if (comment.userId !== userData.id && !['ADMIN', 'MODERATOR'].includes(userData.role)) {
            return res.status(403).json({ error: 'Unauthorized to update this comment' });
        }

        const updatedComment = await prisma.comment.update({
            where: { id },
            data: { content },
            include: commentIncludeQuery
        });

        res.json({ data: updatedComment });
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ error: 'Failed to update comment' });
    }
};

export const deleteComment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userEmail = req.headers['user-email'] as string;
        if (!userEmail) return res.status(401).json({ error: 'Authentication required' });

        const comment = await prisma.comment.findUnique({ where: { id } });
        if (!comment) return res.status(404).json({ error: 'Comment not found' });

        const userData = await findUserByEmail(userEmail);
        if (!userData) return res.status(404).json({ error: 'User not found' });

        if (comment.userId !== userData.id && !['ADMIN', 'MODERATOR'].includes(userData.role)) {
            return res.status(403).json({ error: 'Unauthorized to delete this comment' });
        }

        await prisma.$transaction([
            prisma.like.deleteMany({ where: { commentId: id } }),
            prisma.comment.deleteMany({ where: { parentId: id } }),
            prisma.comment.delete({ where: { id } })
        ]);

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
};

export const getCommentsByPost = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        const { page, limit, orderBy } = req.query;

        // Validate postId
        if (!postId || typeof postId !== 'string') {
            return res.status(400).json({ 
                error: 'Invalid post ID',
                details: 'Post ID must be a valid string'
            });
        }

        // Validate pagination parameters
        const validatedPage = page ? parseInt(page as string) : 1;
        const validatedLimit = limit ? parseInt(limit as string) : 10;
        const validatedOrderBy = orderBy as 'asc' | 'desc' || 'desc';

        if (isNaN(validatedPage) || validatedPage < 1) {
            return res.status(400).json({ 
                error: 'Invalid page parameter',
                details: 'Page must be a positive number'
            });
        }

        if (isNaN(validatedLimit) || validatedLimit < 1 || validatedLimit > 100) {
            return res.status(400).json({ 
                error: 'Invalid limit parameter',
                details: 'Limit must be a number between 1 and 100'
            });
        }

        // Check if post exists
        const post = await prisma.post.findUnique({ 
            where: { id: postId },
            select: { id: true } // Only select ID for performance
        });

        if (!post) {
            return res.status(404).json({ 
                error: 'Post not found',
                details: `No post found with ID: ${postId}`
            });
        }

        const paginationOptions = processPagination({
            page: validatedPage,
            limit: validatedLimit,
            orderBy: validatedOrderBy
        });

        const [comments, total] = await prisma.$transaction([
            prisma.comment.findMany({
                where: { 
                    postId,
                    parentId: null // Only fetch top-level comments
                },
                ...paginationOptions,
                include: commentIncludeQuery
            }),
            prisma.comment.count({
                where: { 
                    postId,
                    parentId: null
                }
            })
        ]).catch(error => {
            console.error('Prisma transaction error:', error);
            throw new Error('Database operation failed');
        });

        const commentsWithStats = comments.map(comment => ({
            ...comment,
            stats: {
                likeCount: comment._count.likes,
                replyCount: comment._count.replies,
                totalEngagement: comment._count.likes + comment._count.replies
            }
        }));

        res.json({
            data: commentsWithStats,
            meta: {
                total,
                page: validatedPage,
                limit: validatedLimit,
                totalPages: Math.ceil(total / validatedLimit)
            }
        });
    } catch (error) {
        console.error('Error in getCommentsByPost:', error);
        
        // Handle specific error types
        if (error instanceof Error) {
            if (error.message === 'Database operation failed') {
                return res.status(503).json({
                    error: 'Service temporarily unavailable',
                    details: 'Database operation failed'
                });
            }
        }

        // Generic error response
        res.status(500).json({ 
            error: 'Internal server error',
            details: 'An unexpected error occurred while fetching comments'
        });
    }
};

export const getReplies = async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params;
        const { page, limit, orderBy } = req.query;

        const comment = await prisma.comment.findUnique({ where: { id: commentId } });
        if (!comment) return res.status(404).json({ error: 'Comment not found' });

        const paginationOptions = processPagination({
            page: Number(page),
            limit: Number(limit),
            orderBy: orderBy as 'asc' | 'desc'
        });

        const [replies, total] = await prisma.$transaction([
            prisma.comment.findMany({
                where: { parentId: commentId },
                ...paginationOptions,
                include: {
                    likes: true,
                    _count: {
                        select: {
                            likes: true
                        }
                    }
                }
            }),
            prisma.comment.count({
                where: { parentId: commentId }
            })
        ]);

        const repliesWithStats = replies.map(reply => ({
            ...reply,
            stats: {
                likeCount: reply._count.likes
            }
        }));

        res.json({
            data: repliesWithStats,
            meta: {
                total,
                page: Number(page) || 1,
                limit: Number(limit) || 10,
                totalPages: Math.ceil(total / (Number(limit) || 10))
            }
        });
    } catch (error) {
        console.error('Error fetching replies:', error);
        res.status(500).json({ error: 'Failed to fetch replies' });
    }
};

export const toggleLike = async (req: Request, res: Response) => {
    try {
        const { id: commentId } = req.params;
        const userEmail = req.headers['user-email'] as string;
        if (!userEmail) return res.status(401).json({ error: 'Authentication required' });

        const comment = await prisma.comment.findUnique({ where: { id: commentId } });
        if (!comment) return res.status(404).json({ error: 'Comment not found' });

        const userData = await findUserByEmail(userEmail);
        if (!userData) return res.status(404).json({ error: 'User not found' });

        const existingLike = await prisma.like.findFirst({
            where: {
                commentId,
                userId: userData.id
            }
        });

        if (existingLike) {
            await prisma.like.delete({
                where: { id: existingLike.id }
            });
            res.json({ message: 'Like removed' });
        } else {
            await prisma.like.create({
                data: {
                    commentId,
                    userId: userData.id,
                    postId: comment.postId
                }
            });
            res.json({ message: 'Like added' });
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({ error: 'Failed to toggle like' });
    }
};

export const getAllComments = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const userEmail = req.headers['user-email'] as string;
        
        if (!userEmail) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = await findUserByEmail(userEmail);
        if (!user || !['PLATFORM_ADMIN', 'SCHOOL_ADMIN', 'MODERATOR'].includes(user.role)) {
            return res.status(403).json({ error: 'Unauthorized to view all comments' });
        }

        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);

        const [comments, total] = await Promise.all([
            prisma.comment.findMany({
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                include: {
                    post: {
                        select: {
                            title: true,
                            slug: true
                        }
                    },
                    _count: {
                        select: {
                            likes: true,
                            replies: true
                        }
                    }
                }
            }),
            prisma.comment.count()
        ]);

        const totalPages = Math.ceil(total / Number(limit));
        const currentPage = Number(page);
        
        return res.json({
            comments,
            total,
            page: currentPage,
            totalPages
        });
    } catch (error) {
        console.error('Error fetching all comments:', error);
        return res.status(500).json({ error: 'Failed to fetch comments' });
    }
};

export const blockComment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userEmail = req.headers['user-email'] as string;
        if (!userEmail) return res.status(401).json({ error: 'Authentication required' });

        const user = await findUserByEmail(userEmail);
        if (!user || !['PLATFORM_ADMIN', 'SCHOOL_ADMIN', 'MODERATOR'].includes(user.role)) {
            return res.status(403).json({ error: 'Unauthorized to block comments' });
        }

        const comment = await prisma.comment.findUnique({ where: { id } });
        if (!comment) return res.status(404).json({ error: 'Comment not found' });

        const updatedComment = await prisma.comment.update({
            where: { id },
            data: { isBlocked: !comment.isBlocked },
            include: {
                post: {
                    select: {
                        title: true,
                        slug: true
                    }
                },
                _count: {
                    select: {
                        likes: true,
                        replies: true
                    }
                }
            }
        });

        res.json({ data: updatedComment });
    } catch (error) {
        console.error('Error toggling comment block status:', error);
        res.status(500).json({ error: 'Failed to update comment status' });
    }
};
