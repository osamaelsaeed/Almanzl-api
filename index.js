import 'dotenv/config';
import express, { urlencoded } from 'express';
import initDB from './src/config/db.js';
import morgan from 'morgan';
import { PORT, NODE_ENV } from './src/config/config.js';

initDB();

import productRouter from './src/routes/product.routes.js';
import userRouter from './src/routes/user.routes.js';
import globalErrorHandler from './src/utils/globalErrorHandler.js';
import AppError from './src/utils/AppError.js';

const app = express();

app.set('query parser', 'extended');
app.use(express.json());
app.use(urlencoded({ extended: true }));

if (NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use('/api/products', productRouter);
app.use('/api/auth', userRouter);

app.all('*all', (req, res, next) =>
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404))
);
app.use(globalErrorHandler);

app.listen(PORT, () => {
    console.log(`app is running on port ${PORT}`);
});
export default app;
