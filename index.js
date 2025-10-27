import express, { urlencoded } from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';

import productRouter from './src/routes/product.routes.js';
import globalErrorHandler from './src/utils/globalErrorHandler';
import AppError from './src/utils/AppError.js';

const app = express();
dotenv.config();

app.use(express.json());
app.use(urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use('/api/products', productRouter);


app.all('*', (req, res, next) =>
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404)),
);
app.use(globalErrorHandler);

export default app;
