import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

const localAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) throw new Error('No authentication header');

        const token = authHeader.split(' ')[1];


        const claim = jwt.decode(token) as jwt.JwtPayload;

        if (!claim) {
            throw new Error('Invalid token');
        }

        const currentSeconds = Math.floor(Date.now() / 1000);
        if (claim.exp && currentSeconds > claim.exp) {
            throw new Error('Token is expired');
        }

        req.user = claim;
        next();
    } catch (error) {
        logger.error('Authentication error:', error);
        res.status(401).json({ error: 'Not Authorized' });
    }
};

export { localAuthMiddleware };
