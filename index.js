import 'dotenv/config';
import express, { urlencoded } from 'express';
import initDB from './src/config/db.js';
import morgan from 'morgan';
import { PORT, NODE_ENV, CLIENT_URL } from './src/config/config.js';
import cors from 'cors';

initDB();

import AppError from './src/utils/AppError.js';
import productRouter from './src/routes/product.routes.js';
import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import orderRouter from './src/routes/order.routes.js';
import categoryRouter from './src/routes/category.routes.js';
import stripeWebhookRoute from './src/routes/stripeWebhookRoute.js';
import globalErrorHandler from './src/utils/globalErrorHandler.js';
import cartRoutes from './src/routes/cart.routes.js';
import statisticsRoutes from './src/routes/statistics.routes.js';
import swaggerUi from 'swagger-ui-express';
import swaggerUiDist from 'swagger-ui-dist';
import pkg from 'fs-extra';
const { readFile } = pkg;
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerDocument = JSON.parse(
    await readFile(new URL('./swagger/swagger.json', import.meta.url))
);

const app = express();
// keep this route here before express.json Stripe requires the raw body to verify the signature.

app.use('/api/stripe', stripeWebhookRoute);

app.set('query parser', 'extended');
app.use(express.json());
app.use(urlencoded({ extended: true }));

app.use(
    cors({
        origin: CLIENT_URL,
        credentials: true,
    })
);
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    next();
});

if (NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
app.get('/api-docs/swagger.json', async (req, res) => {
    const filePath = path.join(__dirname, 'swagger', 'swagger.json');
    const data = await readFile(filePath, 'utf-8');
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.parse(data));
});

// Serve Swagger UI
app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(null, {
        swaggerOptions: {
            url: '/api-docs/swagger.json',
        },
    })
);

app.use('/api/products', productRouter);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/orders', orderRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/cart', cartRoutes);
app.use('/api/statistics', statisticsRoutes);

app.all('*all', (req, res, next) =>
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404))
);
app.use(globalErrorHandler);

app.listen(PORT, () => {
    console.log(`app is running on port ${PORT}`);
});
export default app;
