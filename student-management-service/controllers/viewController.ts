import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { findUserByEmail } from '../utils/findUserByEmail';

const prisma = new PrismaClient();

interface ViewStats {
    uniqueViewers: number;
    totalVisits: number;
    averageVisitsPerUser: number;
    viewsByTimeframe: {
        last24Hours: number;
        lastWeek: number;
        lastMonth: number;
    };
}

export const trackView = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        const userEmail = req.headers['user-email'] as string;
        
        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) return res.status(404).json({ error: 'Post not found' });

        let view;
        if (userEmail) {
            const userData = await findUserByEmail(userEmail);
            if (userData) {
                view = await prisma.view.upsert({
                    where: {
                        postId_userId: {
                            postId,
                            userId: userData.id
                        }
                    },
                    create: {
                        postId,
                        userId: userData.id,
                        firstViewedAt: new Date(),
                        lastViewedAt: new Date(),
                        visitCount: 1
                    },
                    update: {
                        lastViewedAt: new Date(),
                        visitCount: { increment: 1 }
                    }
                });
            }
        }

        res.json({ data: post, viewStats: view });
    } catch (error) {
        console.error('Error tracking view:', error);
        res.status(500).json({ error: 'Failed to track view' });
    }
};

export const getPostViewStats = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;

        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) return res.status(404).json({ error: 'Post not found' });

        const now = new Date();
        const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const [
            allViews,
            last24HourViews,
            lastWeekViews,
            lastMonthViews
        ] = await prisma.$transaction([
            prisma.view.findMany({
                where: { postId },
                select: {
                    userId: true,
                    visitCount: true
                }
            }),
            prisma.view.count({
                where: {
                    postId,
                    lastViewedAt: { gte: last24Hours }
                }
            }),
            prisma.view.count({
                where: {
                    postId,
                    lastViewedAt: { gte: lastWeek }
                }
            }),
            prisma.view.count({
                where: {
                    postId,
                    lastViewedAt: { gte: lastMonth }
                }
            })
        ]);

        const uniqueViewers = allViews.length;
        const totalVisits = allViews.reduce((sum, view) => sum + view.visitCount, 0);

        const stats: ViewStats = {
            uniqueViewers,
            totalVisits,
            averageVisitsPerUser: uniqueViewers > 0 ? totalVisits / uniqueViewers : 0,
            viewsByTimeframe: {
                last24Hours: last24HourViews,
                lastWeek: lastWeekViews,
                lastMonth: lastMonthViews
            }
        };

        res.json({ data: stats });
    } catch (error) {
        console.error('Error fetching view stats:', error);
        res.status(500).json({ error: 'Failed to fetch view statistics' });
    }
};

export const getTopViewedPosts = async (req: Request, res: Response) => {
    try {
        const { timeframe = '7days', limit = 10 } = req.query;
        
        const now = new Date();
        let startDate: Date;
        
        switch (timeframe) {
            case '24hours':
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case '7days':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30days':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        }

        const posts = await prisma.post.findMany({
            take: Number(limit),
            where: {
                views: {
                    some: {
                        lastViewedAt: { gte: startDate }
                    }
                }
            },
            select: {
                id: true,
                title: true,
                type: true,
                status: true,
                authorName: true,
                createdAt: true,
                _count: {
                    select: {
                        views: true,
                        likes: true,
                        comments: true
                    }
                },
                views: {
                    where: {
                        lastViewedAt: { gte: startDate }
                    },
                    select: {
                        visitCount: true
                    }
                }
            },
            orderBy: {
                views: {
                    _count: 'desc'
                }
            }
        });

        const postsWithStats = posts.map(post => ({
            ...post,
            totalVisits: post.views.reduce((sum, view) => sum + view.visitCount, 0),
            engagementScore: calculateEngagementScore(post)
        }));

        res.json({ data: postsWithStats });
    } catch (error) {
        console.error('Error fetching top viewed posts:', error);
        res.status(500).json({ error: 'Failed to fetch top viewed posts' });
    }
};

const calculateEngagementScore = (post: any): number => {
    const viewWeight = 1;
    const likeWeight = 2;
    const commentWeight = 3;

    const viewScore = post._count.views * viewWeight;
    const likeScore = post._count.likes * likeWeight;
    const commentScore = post._count.comments * commentWeight;

    return viewScore + likeScore + commentScore;
};
