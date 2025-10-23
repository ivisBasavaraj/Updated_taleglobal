const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
require('dotenv').config();

const { connectDB } = require('./config/database');
const errorHandler = require('./middlewares/errorHandler');
const { initializeWebSocket } = require('./utils/websocket');

// Import Routes
const publicRoutes = require('./routes/public');
const candidateRoutes = require('./routes/candidate');
const employerRoutes = require('./routes/employer');
const adminRoutes = require('./routes/admin');
const placementRoutes = require('./routes/placement');
const holidaysRoutes = require('./routes/holidays');

const app = express();

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Connect to Database
connectDB();

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: ['http://localhost:3000', 'https://taleglobal.cloud', 'https://www.taleglobal.cloud'],
  credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // limit each IP to 10000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Body Parser Middleware with error handling
app.use(express.json({ 
  limit: '50mb',
  verify: (req, res, buf, encoding) => {
    // Log request size for debugging
    if (buf && buf.length > 10 * 1024 * 1024) { // 10MB
      // Removed console debug line for security;
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Handle payload too large errors
app.use((error, req, res, next) => {
  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Request too large. Please upload files individually and try saving again.'
    });
  }
  next(error);
});

// Note: Static file serving removed - all files now stored as Base64 in database

// API Routes
app.use('/api/public', publicRoutes);
app.use('/api/candidate', candidateRoutes);
app.use('/api/employer', employerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/placement', placementRoutes);
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api', holidaysRoutes);

// Health Check Route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Tale Job Portal API is running' });
});

// Error Handling Middleware
app.use(errorHandler);

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

// Create HTTP server and initialize WebSocket
const server = http.createServer(app);
initializeWebSocket(server);

server.listen(PORT, () => {
  console.log(`Tale Job Portal API running on port ${PORT}`);
  console.log('WebSocket server initialized for real-time updates');
});