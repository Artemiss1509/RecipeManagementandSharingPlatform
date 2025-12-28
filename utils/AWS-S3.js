import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME } from './env.js';
import crypto from 'crypto';

const s3Client = new S3Client({
    region: AWS_REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY
    }
});

export const uploadToS3 = async (file) => {
    const fileName = `${crypto.randomBytes(16).toString('hex')}-${file.originalname}`;
    
    const params = {
        Bucket: S3_BUCKET_NAME,
        Key: `recipes/${fileName}`,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read'
    };

    try {
        await s3Client.send(new PutObjectCommand(params));
        return `https://${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/recipes/${fileName}`;
    } catch (error) {
        throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
};

export const deleteFromS3 = async (fileUrl) => {
    const fileName = fileUrl.split('/').pop();
    
    const params = {
        Bucket: S3_BUCKET_NAME,
        Key: `recipes/${fileName}`
    };

    try {
        await s3Client.send(new DeleteObjectCommand(params));
    } catch (error) {
        throw new Error(`Failed to delete file from S3: ${error.message}`);
    }
};