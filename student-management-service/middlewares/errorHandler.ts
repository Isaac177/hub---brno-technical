import { Request, Response, NextFunction } from 'express';
import { BaseError, InternalServerError } from '../utils/errors';
import { logger } from "../utils/logger";

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(err);

    try {
        if (err instanceof BaseError) {
            return res.status(err.statusCode).json({
                status: 'error',
                statusCode: err.statusCode,
                message: req.t ? req.t(err.messageKey, err.messageParams) : err.messageKey,
                meta: {
                    error: {
                        statusCode: err.statusCode,
                        messageKey: err.messageKey,
                        messageParams: err.messageParams || {}
                    }
                }
            });
        }

        const internalError = new InternalServerError();
        res.status(internalError.statusCode).json({
            status: 'error',
            statusCode: internalError.statusCode,
            message: req.t ? req.t(internalError.messageKey) : 'Internal server error',
            meta: {}
        });
    } catch (handlerError) {
        logger.error('Error in error handler:', handlerError);
        // Ultimate fallback if translation fails
        res.status(500).json({
            status: 'error',
            statusCode: 500,
            message: 'Internal server error',
            meta: {}
        });
    }
};
