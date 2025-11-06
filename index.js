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
import pkg from 'fs-extra';
const { readFile } = pkg;

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

// Serve a small custom Swagger UI HTML that uses CDN assets. This avoids serving
// local swagger-ui JS files which can be rewritten by some hosts (like Vercel)
// and return HTML instead of JS (causing `Unexpected token '<'`).
const SWAGGER_CSS = 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.3/swagger-ui.min.css';
const SWAGGER_BUNDLE =
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.3/swagger-ui-bundle.min.js';
const SWAGGER_STANDALONE =
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.3/swagger-ui-standalone-preset.min.js';

app.get('/api-docs', (req, res) => {
    // Use a relative URL so the browser requests the JSON from the same origin/path
    const swaggerUrl = '/swagger.json';
    const customCss =
        '.swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }';
    res.setHeader('Content-Type', 'text/html');
    res.send(`<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>API Docs</title>
        <link rel="stylesheet" href="${SWAGGER_CSS}" />
        <style>${customCss}</style>
    </head>
    <body>
        <div id="swagger-ui"></div>
        <script src="${SWAGGER_BUNDLE}"></script>
        <script src="${SWAGGER_STANDALONE}"></script>
        <script>
            window.onload = function() {
                const ui = SwaggerUIBundle({
                    url: '${swaggerUrl}',
                    dom_id: '#swagger-ui',
                    deepLinking: true,
                    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
                    layout: 'BaseLayout'
                });
                window.ui = ui;
            };
        </script>
    </body>
</html>`);
});

app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocument);
});

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
