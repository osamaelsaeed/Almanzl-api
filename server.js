import app from './index.js';

import mongoose from 'mongoose';

mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
        console.log('✅ Database Connected');

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ Database connection failed:', err);
    });
