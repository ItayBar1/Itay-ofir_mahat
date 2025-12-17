import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import courseRoutes from './routes/courseRoutes';
import paymentRoutes from './routes/payments';
import studentRoutes from './routes/studentRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

export const app = express();

// הגדרות אבטחה בסיסיות
app.use(helmet());

// הגדרת CORS
app.use(cors({
    origin: process.env.CLIENT_URL, 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/courses', courseRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running 🚀' });
});

export default app;