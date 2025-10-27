import express, { urlencoded } from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';

import productRouter from './src/routes/product.routes.js';
import { ERROR } from './src/utils/reposnseStatus.js';

const app = express();
dotenv.config();

app.use(express.json());
app.use(urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use('/api/products', productRouter);

app.use((err, req, res, next) => {
    const msg = err.message || 'Something went wrong';
    const statusCode = err.statusCode || 500;
    const statusText = err.statusText || ERROR;
    const error = {
        statusText,
        msg,
    };
    if (process.env.NODE_ENV === 'development') error.stackTrace = err.stack;

    return res.status(statusCode).json({ error });
});

export default app;
