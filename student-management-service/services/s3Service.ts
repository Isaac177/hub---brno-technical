import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from '../utils/logger';

class S3Service {
    private s3Client: S3Client;
    private bucket: string;

    constructor() {
        this.bucket = process.env.AWS_S3_BUCKET || '';
        this.s3Client = new S3Client({
            region: process.env.AWS_REGION || 'us-east-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
            },
            requestHandler: {
                requestTimeout: 300000, // 5 minutes
                connectionTimeout: 30000, // 30 seconds
            },
            maxAttempts: 3,
        });
    }

    async uploadImage(base64Image: string, fileName: string): Promise<string> {
        const maxRetries = 3;
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                // Remove data:image/xyz;base64, prefix
                const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
                const buffer = Buffer.from(base64Data, 'base64');

                // Generate a unique file name
                const uniqueFileName = `${Date.now()}-${fileName}`;

                const command = new PutObjectCommand({
                    Bucket: this.bucket,
                    Key: `images/${uniqueFileName}`,
                    Body: buffer,
                    ContentType: this.getContentType(base64Image),
                    // ACL removed as the bucket uses Bucket Owner Enforced setting for Object Ownership
                });

                await this.s3Client.send(command);

                // Return the public URL
                return `https://${this.bucket}.s3.amazonaws.com/images/${uniqueFileName}`;
            } catch (error: any) {
                lastError = error;
                logger.error(`Error uploading image to S3 (attempt ${attempt}/${maxRetries}):`, error);
                
                // If this is not the last attempt, wait before retrying
                if (attempt < maxRetries) {
                    const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
                    logger.info(`Retrying upload in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        logger.error('Failed to upload image after all retries:', lastError);
        throw new Error('Failed to upload image after multiple attempts');
    }

    private getContentType(base64String: string): string {
        const match = base64String.match(/^data:image\/(\w+);base64,/);
        return match ? `image/${match[1]}` : 'image/jpeg';
    }
}

export const s3Service = new S3Service();
