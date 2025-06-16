import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import AdminRoutes from './routes/adminRoutes.js';
import JobRoutes from './routes/jobRoutes.js';
import UserRoutes from './routes/userRoutes.js';
import NotificationRoutes from './routes/notificationRoutes.js';
// import superAdminRoutes from './routes/superAdminRoutes.js';
// import UserRoutes from './routes/userRoutes.js'; // You can uncomment if needed

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // OK
app.use(express.urlencoded({ extended: true }));
// MongoDB connection
mongoose.connect(process.env.MONGO_URL,).then(() => {
    console.log(' Connected to MongoDB');
}).catch((error) => {
    console.error(' MongoDB connection error:', error.message);
});

// Root route
app.get('/', (req, res) => {
    res.send('🚀 Candidate Portal API is running...');
});

// Routes
app.use('/api/v1/admin', AdminRoutes);
// app.use('/api/v1/superAdmin', superAdminRoutes);
app.use('/api/v1/job', JobRoutes);
app.use('/api/v1/user', UserRoutes);
app.use('/api/v1/user', UserRoutes);
app.use('/api/v1/notification', NotificationRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🌐 Server is running on: http://localhost:${PORT}`);
});
