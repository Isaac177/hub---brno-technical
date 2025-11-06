import { Request, Response } from 'express';
import { PrismaClient, PostType, PostStatus } from '@prisma/client';
import { findUserByEmail } from '../utils/findUserByEmail';
import { customSlugify } from '../utils/slugify';
import { s3Service } from '../services/s3Service';

const prisma = new PrismaClient();

interface CreatePostInput {
    title: string;
    content: string;
    type: PostType;
    imageUrl?: string;
    categoryId?: string;
    tags?: { name: string }[];
}

interface PaginationParams {
    page?: number;
    limit?: number;
    orderBy?: 'asc' | 'desc';
}

const safeNumber = (value: any) => {
    if (typeof value === 'bigint') {
      return Number(value);
    }
    return value;
  };

const validateUserPermissions = (userRole: string, postType: PostType): boolean => {
    if (postType === PostType.NEWS) {
        return ['ADMIN', 'MODERATOR', 'PLATFORM_ADMIN'].includes(userRole);
    }
    return true;
};

const generateUniqueSlug = async (title: string, tx?: any): Promise<string> => {
    const baseSlug = customSlugify(title);
    let slug = baseSlug;
    let counter = 1;
    const client = tx || prisma;
    
    while (true) {
        const existingPost = await client.post.findUnique({
            where: { slug }
        });
        
        if (!existingPost) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
    
    return slug;
};

const processPagination = ({ page = 1, limit = 10, orderBy = 'desc' }: PaginationParams) => ({
    take: limit,
    skip: (page - 1) * limit,
    orderBy: { createdAt: orderBy }
});

const postIncludeQuery = {
    category: true,
    tags: true,
    comments: {
        include: {
            likes: true,
            replies: {
                include: {
                    likes: true
                }
            }
        }
    },
    likes: true,
    views: true,
    _count: {
        select: {
            comments: true,
            likes: true,
            views: true,
            tags: true
        }
    }
};

export const createPost = async (req: Request, res: Response) => {
    try {
        console.log('createPost - Request headers:', JSON.stringify(req.headers, null, 2));
        console.log('createPost - Request body:', JSON.stringify(req.body, null, 2));
        
        const userEmail = req.headers['user-email'] as string;
        if (!userEmail) {
            console.log('createPost - Missing user-email header');
            return res.status(401).json({ error: 'Authentication required' });
        }

        const { title, content, type, imageUrl, categoryId, tags }: CreatePostInput = req.body;

        if (!title || !content || !type) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const userData = await findUserByEmail(userEmail);
        if (!userData) {
            return res.status(403).json({ 
                error: 'User not found or inactive. Please ensure your account is active before creating posts.' 
            });
        }

        if (!userData.id) {
            return res.status(500).json({ 
                error: 'Invalid user data. User ID is missing.' 
            });
        }

        console.log('User data', JSON.stringify(userData, null, 2));

        if (!validateUserPermissions(userData.role, type)) {
            return res.status(403).json({ error: 'You do not have permission to create this type of post' });
        }

        let finalImageUrl = imageUrl;
        if (imageUrl && imageUrl.startsWith('data:image')) {
            finalImageUrl = await s3Service.uploadImage(imageUrl, 'post-image');
        }

        const post = await prisma.$transaction(async (tx) => {
            const slug = await generateUniqueSlug(title, tx);
            const newPost = await tx.post.create({
                data: {
                    title,
                    content,
                    type,
                    slug,
                    userId: userData.id,
                    authorName: `${userData.firstName} ${userData.lastName}`,
                    authorAvatar: userData.avatarUrl,
                    imageUrl: finalImageUrl,
                    categoryId,
                    status: type === PostType.NEWS ? PostStatus.DRAFT : PostStatus.PUBLISHED,
                    publishedAt: type === PostType.NEWS ? null : new Date(),
                    tags: {
                        connectOrCreate: tags?.map(tag => ({
                            where: { name: tag.name },
                            create: {
                                name: tag.name,
                                slug: customSlugify(tag.name)
                            }
                        })) || []
                    }
                },
                include: postIncludeQuery
            });

            if (type !== PostType.NEWS) {
                await tx.view.create({
                    data: {
                        postId: newPost.id,
                        userId: userData.id
                    }
                });
            }

            return newPost;
        });

        res.status(201).json({ data: post });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Failed to create post' });
    }
};

export const updatePost = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userEmail = req.headers['user-email'] as string;

        if (!userEmail) return res.status(401).json({ error: 'Authentication required' });

        const post = await prisma.post.findUnique({ 
            where: { id },
            include: { tags: true }
        });
        if (!post) return res.status(404).json({ error: 'Post not found' });

        const userData = await findUserByEmail(userEmail);
        if (!userData) {
            return res.status(403).json({ 
                error: 'User not found or inactive. Please ensure your account is active before updating posts.' 
            });
        }

        if (!userData.id) {
            return res.status(500).json({ 
                error: 'Invalid user data. User ID is missing.' 
            });
        }

        if (post.userId !== userData.id && !['ADMIN', 'MODERATOR', 'PLATFORM_ADMIN'].includes(userData.role)) {
            return res.status(403).json({ error: 'Unauthorized to update this post' });
        }

        const { title, content, status, imageUrl, categoryId, tags } = req.body;

        let finalImageUrl = imageUrl;
        if (imageUrl && imageUrl.startsWith('data:image')) {
            finalImageUrl = await s3Service.uploadImage(imageUrl, 'post-image');
        }

        const updatedPost = await prisma.$transaction(async (tx) => {
            let slug = post.slug;
            if (title && title !== post.title) {
                slug = await generateUniqueSlug(title, tx);
            }
            if (tags) {
                await tx.post.update({
                    where: { id },
                    data: {
                        tags: {
                            disconnect: post.tags.map(tag => ({ id: tag.id }))
                        }
                    }
                });
            }

            return tx.post.update({
                where: { id },
                data: {
                    title,
                    content,
                    slug,
                    status,
                    imageUrl: finalImageUrl,
                    categoryId,
                    publishedAt: status === PostStatus.PUBLISHED && !post.publishedAt ? new Date() : undefined,
                    tags: tags ? {
                        connectOrCreate: tags.map(tag => ({
                            where: { name: tag.name },
                            create: {
                                name: tag.name,
                                slug: customSlugify(tag.name)
                            }
                        }))
                    } : undefined
                },
                include: postIncludeQuery
            });
        });

        res.json({ data: updatedPost });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ error: 'Failed to update post' });
    }
};

export const deletePost = async (req: Request, res: Response) => {
    try {
        console.log('deletePost - Request headers:', JSON.stringify(req.headers, null, 2));
        const { id } = req.params;
        const userEmail = req.headers['user-email'] as string;
        console.log('deletePost - userEmail extracted:', userEmail);
        
        if (!userEmail) {
            console.log('deletePost - Missing user-email header');
            return res.status(401).json({ error: 'Authentication required' });
        }

        const post = await prisma.post.findUnique({ where: { id } });
        if (!post) return res.status(404).json({ error: 'Post not found' });

        const userData = await findUserByEmail(userEmail);
        if (!userData) {
            return res.status(403).json({ 
                error: 'User not found or inactive. Please ensure your account is active before deleting posts.' 
            });
        }

        if (!userData.id) {
            return res.status(500).json({ 
                error: 'Invalid user data. User ID is missing.' 
            });
        }

        if (post.userId !== userData.id && !['ADMIN', 'MODERATOR', 'PLATFORM_ADMIN'].includes(userData.role)) {
            return res.status(403).json({ error: 'Unauthorized to delete this post' });
        }

        await prisma.$transaction([
            prisma.view.deleteMany({ where: { postId: id } }),
            prisma.like.deleteMany({ where: { postId: id } }),
            prisma.comment.deleteMany({ where: { postId: id } }),
            prisma.post.delete({ where: { id } })
        ]);

        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Failed to delete post' });
    }
};

export const getAllPosts = async (req: Request, res: Response) => {
    try {
        const { page, limit, orderBy, categoryId, search, type } = req.query;
        const paginationOptions = processPagination({
            page: Number(page) || 1,
            limit: Number(limit) || 10,
            orderBy: orderBy as 'asc' | 'desc'
        });

        const where: any = {};

        if (type) {
            const types = Array.isArray(type) ? type : [type];
            // Filter out invalid types and ensure they match PostType enum
            const validTypes = types.filter(t => 
                Object.values(PostType).includes(t as PostType)
            );
            if (validTypes.length > 0) {
                where.type = { in: validTypes };
            }
        }

        if (categoryId) {
            const category = await prisma.category.findFirst({
                where: { slug: categoryId as string }
            });
            if (category) {
                where.categoryId = category.id;
            }
        }

        if (search) {
            where.OR = [
                { title: { contains: search as string, mode: 'insensitive' } },
                { content: { contains: search as string, mode: 'insensitive' } }
            ];
        }

        const [posts, total] = await prisma.$transaction([
            prisma.post.findMany({
                ...paginationOptions,
                where,
                include: postIncludeQuery
            }),
            prisma.post.count({ where })
        ]);

        res.json({
            data: posts,
            meta: {
                total,
                page: Number(page) || 1,
                limit: Number(limit) || 10,
                totalPages: Math.ceil(total / (Number(limit) || 10))
            }
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
};

export const getPostsByType = async (req: Request, res: Response) => {
    try {
        const { type } = req.params;
        const { page, limit, orderBy, categoryId, search } = req.query;
        const paginationOptions = processPagination({
            page: Number(page),
            limit: Number(limit),
            orderBy: orderBy as 'asc' | 'desc'
        });

        const where: any = {
            type: type as PostType
        };

        if (categoryId) {
            const category = await prisma.category.findFirst({
                where: { slug: categoryId as string }
            });
            if (category) {
                where.categoryId = category.id;
            }
        }

        if (search) {
            where.OR = [
                { title: { contains: search as string, mode: 'insensitive' } },
                { content: { contains: search as string, mode: 'insensitive' } },
            ];
        }

        const [posts, total] = await prisma.$transaction([
            prisma.post.findMany({
                ...paginationOptions,
                where,
                include: postIncludeQuery
            }),
            prisma.post.count({ where })
        ]);

        res.json({
            data: posts,
            meta: {
                total,
                page: Number(page) || 1,
                limit: Number(limit) || 10,
                totalPages: Math.ceil(total / (Number(limit) || 10))
            }
        });
    } catch (error) {
        console.error('Error fetching posts by type:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
};

export const getPostById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userEmail = req.headers['user-email'] as string;

        const [post, userData] = await Promise.all([
            prisma.post.findUnique({
                where: { id },
                include: postIncludeQuery
            }),
            userEmail ? findUserByEmail(userEmail) : null
        ]);

        if (!post) return res.status(404).json({ error: 'Post not found' });

        if (userEmail && userData) {
            await prisma.view.upsert({
                where: {
                    postId_userId: {
                        postId: id,
                        userId: userData.id
                    }
                },
                create: {
                    postId: id,
                    userId: userData.id
                },
                update: {
                    lastViewedAt: new Date(),
                    visitCount: { increment: 1 }
                }
            });
        }

        const stats = {
            totalComments: post._count.comments,
            totalLikes: post._count.likes,
            totalViews: post._count.views,
            totalTags: post._count.tags,
            commentsWithReplies: post.comments.reduce((total, comment) => 
                total + 1 + comment.replies.length, 0
            ),
            commentLikes: post.comments.reduce((total, comment) => 
                total + comment.likes.length + 
                comment.replies.reduce((replyTotal, reply) => 
                    replyTotal + reply.likes.length, 0
                ), 0
            ),
            uniqueViewers: post.views.length,
            totalVisits: post.views.reduce((total, view) => total + view.visitCount, 0),
            lastViewed: post.views.length > 0 
                ? Math.max(...post.views.map(v => v.lastViewedAt.getTime()))
                : null,
            engagementRate: calculateEngagementRate(post)
        };

        res.json({ 
            data: {
                ...post,
                stats
            }
        });
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ error: 'Failed to fetch post' });
    }
};

export const getPostBySlug = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const userEmail = req.headers['user-email'] as string;

        const [post, userData] = await Promise.all([
            prisma.post.findUnique({
                where: { slug },
                include: postIncludeQuery
            }),
            userEmail ? findUserByEmail(userEmail) : null
        ]);

        if (!post) return res.status(404).json({ error: 'Post not found' });

        if (userEmail && userData) {
            await prisma.view.upsert({
                where: {
                    postId_userId: {
                        postId: post.id,
                        userId: userData.id
                    }
                },
                create: {
                    postId: post.id,
                    userId: userData.id
                },
                update: {
                    lastViewedAt: new Date(),
                    visitCount: { increment: 1 }
                }
            });
        }

        const stats = {
            totalComments: post._count.comments,
            totalLikes: post._count.likes,
            totalViews: post._count.views,
            totalTags: post._count.tags,
            commentsWithReplies: post.comments.reduce((total, comment) => 
                total + 1 + comment.replies.length, 0
            ),
            commentLikes: post.comments.reduce((total, comment) => 
                total + comment.likes.length + 
                comment.replies.reduce((replyTotal, reply) => 
                    replyTotal + reply.likes.length, 0
                ), 0
            ),
            uniqueViewers: post.views.length,
            totalVisits: post.views.reduce((total, view) => total + view.visitCount, 0),
            lastViewed: post.views.length > 0 
                ? Math.max(...post.views.map(v => v.lastViewedAt.getTime()))
                : null,
            engagementRate: calculateEngagementRate(post)
        };

        res.json({ 
            data: {
                ...post,
                stats
            }
        });
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ error: 'Failed to fetch post' });
    }
};

export const togglePostLike = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        const userEmail = req.headers['user-email'] as string;
        
        if (!userEmail) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const userData = await findUserByEmail(userEmail);
        if (!userData) {
            return res.status(404).json({ error: 'User not found' });
        }

        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const existingLike = await prisma.like.findFirst({
            where: {
                postId,
                userId: userData.id,
                commentId: null
            }
        });

        if (existingLike) {
            // Unlike
            await prisma.like.delete({
                where: {
                    id: existingLike.id
                }
            });
        } else {
            // Like
            await prisma.like.create({
                data: {
                    postId,
                    userId: userData.id
                }
            });
        }

        // Get updated post with like count
        const updatedPost = await prisma.post.findUnique({
            where: { id: postId },
            include: {
                _count: {
                    select: { likes: true }
                }
            }
        });

        res.json({ 
            data: {
                liked: !existingLike,
                likeCount: updatedPost?._count.likes || 0
            }
        });
    } catch (error) {
        console.error('Error toggling post like:', error);
        res.status(500).json({ error: 'Failed to toggle post like' });
    }
};

export const getBlogStats = async (req: Request, res: Response) => {
    try {
      const stats = await prisma.$transaction(async (tx) => {
        // Get total posts count and stats by type
        const [
          totalPosts,
          postsByType,
          totalComments,
          totalLikes,
          totalViews,
          postsByStatus,
          postsByCategory,
          categories,
          mostViewedPosts,
          mostCommentedPosts,
          mostLikedPosts
        ] = await Promise.all([
          tx.post.count(),
          tx.post.groupBy({
            by: ['type'],
            _count: true,
          }),
          tx.comment.count(),
          tx.like.count({
            where: {
              postId: { not: null }  // Count only post likes
            }
          }),
          tx.view.count(),
          tx.post.groupBy({
            by: ['status'],
            _count: true,
          }),
          tx.post.groupBy({
            by: ['categoryId'],
            _count: true,
          }),
          tx.category.findMany({
            select: {
              id: true,
              name: true,
              slug: true,
            }
          }),
          tx.post.findMany({
            take: 5,
            where: {
              status: 'PUBLISHED'
            },
            orderBy: {
              views: {
                _count: 'desc'
              }
            },
            select: {
              id: true,
              title: true,
              slug: true,
              authorName: true,
              publishedAt: true,
              category: {
                select: {
                  name: true,
                  slug: true
                }
              },
              _count: {
                select: {
                  views: true,
                  comments: true,
                  likes: true
                }
              }
            }
          }),
          tx.post.findMany({
            take: 5,
            where: {
              status: 'PUBLISHED'
            },
            orderBy: {
              comments: {
                _count: 'desc'
              }
            },
            select: {
              id: true,
              title: true,
              slug: true,
              authorName: true,
              publishedAt: true,
              category: {
                select: {
                  name: true,
                  slug: true
                }
              },
              _count: {
                select: {
                  views: true,
                  comments: true,
                  likes: true
                }
              }
            }
          }),
          tx.post.findMany({
            take: 5,
            where: {
              status: 'PUBLISHED'
            },
            orderBy: {
              likes: {
                _count: 'desc'
              }
            },
            select: {
              id: true,
              title: true,
              slug: true,
              authorName: true,
              publishedAt: true,
              category: {
                select: {
                  name: true,
                  slug: true
                }
              },
              _count: {
                select: {
                  views: true,
                  comments: true,
                  likes: true
                }
              }
            }
          })
        ]);
  
        // Get recent activity (comments and likes)
        const recentActivity = await tx.$queryRaw`
          SELECT * FROM (
            SELECT 
              'COMMENT' as type,
              c.id,
              c."createdAt"::text,
              c."userId",
              c."authorName",
              p.title as "postTitle",
              p.slug as "postSlug"
            FROM comments c
            JOIN posts p ON c."postId" = p.id
            WHERE p.status = 'PUBLISHED'
            
            UNION ALL
            
            SELECT 
              'LIKE' as type,
              l.id,
              l."createdAt"::text,
              l."userId",
              p."authorName",
              p.title as "postTitle",
              p.slug as "postSlug"
            FROM likes l
            JOIN posts p ON l."postId" = p.id
            WHERE p.status = 'PUBLISHED'
          ) activity
          ORDER BY "createdAt" DESC
          LIMIT 10
        `;
  
        // Get engagement trends (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
        const monthlyStats = await tx.$queryRaw`
          WITH months AS (
            SELECT generate_series(
              date_trunc('month', ${sixMonthsAgo}::timestamp),
              date_trunc('month', now()),
              '1 month'::interval
            ) as month
          )
          SELECT 
            months.month::text,
            COALESCE(COUNT(DISTINCT p.id), 0)::int as "newPosts",
            COALESCE(COUNT(DISTINCT c.id), 0)::int as "newComments",
            COALESCE(COUNT(DISTINCT l.id), 0)::int as "newLikes",
            COALESCE(COUNT(DISTINCT v.id), 0)::int as "newViews"
          FROM months
          LEFT JOIN posts p ON date_trunc('month', p."createdAt") = months.month
            AND p.status = 'PUBLISHED'
          LEFT JOIN comments c ON date_trunc('month', c."createdAt") = months.month
          LEFT JOIN likes l ON date_trunc('month', l."createdAt") = months.month
            AND l."postId" IS NOT NULL
          LEFT JOIN views v ON date_trunc('month', v."firstViewedAt") = months.month
          GROUP BY months.month
          ORDER BY months.month ASC
        `;
  
        // Transform the data to avoid BigInt serialization issues
        return {
          overview: {
            totalPosts: safeNumber(totalPosts),
            totalComments: safeNumber(totalComments),
            totalLikes: safeNumber(totalLikes),
            totalViews: safeNumber(totalViews),
            postsByType: Object.fromEntries(
              postsByType.map(p => [p.type, safeNumber(p._count)])
            ),
            postsByStatus: Object.fromEntries(
              postsByStatus.map(p => [p.status, safeNumber(p._count)])
            ),
            postsByCategory: postsByCategory.map(p => ({
              category: categories.find(c => c.id === p.categoryId)?.name || 'Uncategorized',
              count: safeNumber(p._count)
            }))
          },
          topPosts: {
            mostViewed: mostViewedPosts.map(post => ({
              ...post,
              _count: {
                views: safeNumber(post._count.views),
                comments: safeNumber(post._count.comments),
                likes: safeNumber(post._count.likes)
              }
            })),
            mostCommented: mostCommentedPosts.map(post => ({
              ...post,
              _count: {
                views: safeNumber(post._count.views),
                comments: safeNumber(post._count.comments),
                likes: safeNumber(post._count.likes)
              }
            })),
            mostLiked: mostLikedPosts.map(post => ({
              ...post,
              _count: {
                views: safeNumber(post._count.views),
                comments: safeNumber(post._count.comments),
                likes: safeNumber(post._count.likes)
              }
            }))
          },
          recentActivity,
          trends: monthlyStats
        };
      }, {
        maxWait: 10000, // 10s max wait time
        timeout: 20000  // 20s timeout
      });
  
      res.json(stats);
    } catch (error) {
      console.error('Error getting blog stats:', error);
      res.status(500).json({ error: 'Failed to get blog statistics' });
    }
  };

const calculateEngagementRate = (post: any) => {
    const totalInteractions = 
        post._count.likes + 
        post._count.comments + 
        post.views.reduce((total: number, view: any) => total + view.visitCount, 0);
    
    const uniqueUsers = new Set([
        ...post.likes.map((like: any) => like.userId),
        ...post.comments.map((comment: any) => comment.userId),
        ...post.views.map((view: any) => view.userId)
    ]).size;

    return uniqueUsers > 0 ? (totalInteractions / uniqueUsers) : 0;
};
