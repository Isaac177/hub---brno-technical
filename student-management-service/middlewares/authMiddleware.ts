import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import axios from 'axios';
import {logger} from '../utils/logger';

const cognitoPoolId = process.env.COGNITO_POOL_ID;
const cognitoIssuer = `https://cognito-idp.ap-south-1.amazonaws.com/${cognitoPoolId}`;


interface PublicKey {
    instance: any;
    pem: string;
}

interface PublicKeys {
    [key: string]: PublicKey;
}

let cacheKeys: PublicKeys;

const getPublicKeys = async (): Promise<PublicKeys> => {
    if (cacheKeys) {
        logger.info('Using cached keys');
        return cacheKeys;
    }

    const url = `${cognitoIssuer}/.well-known/jwks.json`;
    try {
        const publicKeys = await axios.get(url);
        cacheKeys = publicKeys.data.keys.reduce((agg: PublicKeys, current: any) => {
            const pem = jwkToPem(current);
            agg[current.kid] = {instance: current, pem};
            return agg;
        }, {} as PublicKeys);
        return cacheKeys;
    } catch (error) {
        logger.error('Error fetching public keys:', error);
        throw error;
    }
};

const verifyToken = async (token: string): Promise<jwt.JwtPayload> => {
    const tokenSections = token.split('.');
    if (tokenSections.length < 2) {
        throw new Error('Requested token is invalid');
    }
    const headerJSON = Buffer.from(tokenSections[0], 'base64').toString('utf8');
    const header = JSON.parse(headerJSON);

    const keys = await getPublicKeys();
    const key = keys[header.kid];
    if (key === undefined) {
        throw new Error('Claim made for unknown kid');
    }

    try {
        const claim = jwt.verify(token, key.pem) as jwt.JwtPayload;

        const currentSeconds = Math.floor(Date.now() / 1000);
        if (currentSeconds > claim.exp! || currentSeconds < claim.auth_time!) {
            throw new Error('Claim is expired or invalid');
        }
        if (claim.iss !== cognitoIssuer) {
            logger.error(`Invalid issuer: ${claim.iss}`);
            throw new Error('Claim issuer is invalid');
        }
        if (claim.token_use !== 'id') {
            logger.error(`Invalid token use: ${claim.token_use}`);
            throw new Error('Claim use is not id');
        }

        return claim;
    } catch (error) {
        logger.error('Error verifying token:', error);
        throw error;
    }
};

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const authHeader = req.headers.authorization || req.query.token || req.headers['x-auth-token'];
        if (!authHeader) {
            logger.error('No authentication header found');
            return res.status(401).json({error: 'No authentication header'});
        }

        if (typeof authHeader === "string") {
            let token = authHeader.split(' ')[1];
            try {
                const claim = await verifyToken(token);
                req.user = claim;
                next();
            } catch (error) {
                logger.error('Token verification failed:', error);
                return res.status(401).json({error: 'Invalid token'});
            }
        } else {
            return res.status(401).json({error: 'Invalid authorization header format'});
        }
    } catch (error) {
        logger.error('Authentication error:', error);
        res.status(500).json({error: 'Internal server error during authentication'});
    }
};
declare global {
    namespace Express {
        interface Request {
            user?: jwt.JwtPayload;
        }
    }
}
