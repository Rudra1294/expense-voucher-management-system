import dotenv from 'dotenv';
// Load environment variables
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import voucherRoutes from './routes/voucherRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

// Initialize Express and Connect DB
const app = express();
connectDB();

// Middlewares
app.use(cors());
app.use(express.json()); // Parses incoming JSON payloads
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded data

//Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'API is running' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});