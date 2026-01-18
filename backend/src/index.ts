import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { register } from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 8787;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Register routes
register(app);

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    ok: false,
    error: 'Internal server error',
    message: err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 402Routes API running on http://localhost:${PORT}`);
  console.log(`📡 Network: ${process.env.NETWORK || 'cronos-testnet'}`);
  console.log(`🌐 Frontend: ${FRONTEND_URL}`);
});
