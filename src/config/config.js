import dotenv from 'dotenv';
import path from 'path';

const env = process.env.NODE_ENV || 'development';

dotenv.config({ path: path.resolve(`.env.${env}`) });

export const PORT = process.env.PORT;
export const MONGO_URI = process.env.MONGO_URI;
export const NODE_ENV = env;
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
export const CLIENT_URL = process.env.CLIENT_URL;
export const DOCS_URL = process.env.DOCS_URL;
