import { Socket } from 'socket.io';
import { logger } from '../../../utils/logger';

export function handleConnection(socket: Socket) {
    const clientInfo = {
        id: socket.id,
        email: socket.handshake.auth?.email,
        ip: socket.handshake.address,
        timestamp: new Date().toISOString()
    };

    logger.info('Client connected:', {
        ...clientInfo,
        origin: socket.handshake.headers.origin,
        transport: socket.conn.transport.name
    });

    socket.on('disconnect', (reason) => {
        logger.info('Client disconnected:', {
            id: socket.id,
            email: socket.handshake.auth?.email,
            reason,
            duration: `${Math.round((Date.now() - new Date(clientInfo.timestamp).getTime()) / 1000)}s`,
            timestamp: new Date().toISOString()
        });
    });

    socket.on('error', (error) => {
        logger.error('Socket error:', {
            id: socket.id,
            email: socket.handshake.auth?.email,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    });
}
