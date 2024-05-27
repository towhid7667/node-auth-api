import express from 'express';
import dotenv from 'dotenv';
import initModels from './models/index.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config(); // Load environment variables from .env file

const app = express();
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        const db = await initModels();
        await db.sequelize.authenticate();
        console.log('Database connected!');

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

startServer();
