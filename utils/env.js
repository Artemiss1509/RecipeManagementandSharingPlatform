import { config } from "dotenv";


config({path: `.env.${process.env.NODE_ENV || 'dev'}.local`});

export const {JWT_SECRET, JWT_EXPIRY, AWS_REGION, S3_BUCKET_NAME, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = process.env;