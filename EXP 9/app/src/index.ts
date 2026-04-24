import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { Pool } from 'pg';
import { createClient } from 'redis';
import { v4 as uuidv4 } from 'uuid';
import pino from 'pino';

// Initialize logger
const logger = pino(
  process.env.NODE_ENV === 'production'
    ? undefined
    : {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
      }
);

// Initialize Express app
const app: Express = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL connection pool
const pgPool = new Pool({
  user: process.env.DB_USER || 'appuser',
  password: process.env.DB_PASSWORD || 'apppassword',
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'appdb',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Redis client
const redisClient = createClient({
  host: process.env.REDIS_HOST || 'redis',
  port: parseInt(process.env.REDIS_PORT || '6379'),
});

redisClient.on('error', (err) => logger.error('Redis Client Error', err));
redisClient.on('connect', () => logger.info('Connected to Redis'));

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(morgan('combined'));

// Request ID middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  req.id = uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error({
    error: err.message,
    stack: err.stack,
    requestId: req.id,
  });

  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    requestId: req.id,
  });
});

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Check database connection
    const dbResult = await pgPool.query('SELECT NOW()');

    // Check Redis connection
    const redisReady = redisClient.isReady;

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbResult.rows[0].now ? 'connected' : 'disconnected',
      cache: redisReady ? 'connected' : 'disconnected',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  } catch (error) {
    logger.error('Health check failed', error);
    res.status(503).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Ready endpoint
app.get('/ready', async (req: Request, res: Response) => {
  try {
    await pgPool.query('SELECT 1');
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'not ready' });
  }
});

// Version endpoint
app.get('/version', (req: Request, res: Response) => {
  res.json({
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// API endpoints
app.get('/api/stats', async (req: Request, res: Response) => {
  try {
    const cacheKey = 'app:stats';

    // Try to get from cache
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // Get from database
    const result = await pgPool.query(
      'SELECT COUNT(*) as request_count, AVG(EXTRACT(EPOCH FROM created_at)) as avg_response_time FROM requests WHERE created_at > NOW() - INTERVAL \'1 hour\''
    );

    const stats = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      requests: result.rows[0],
      timestamp: new Date().toISOString(),
    };

    // Cache for 5 minutes
    await redisClient.setEx(cacheKey, 300, JSON.stringify(stats));

    res.json(stats);
  } catch (error) {
    logger.error('Stats endpoint error', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Create table endpoint (for initialization)
app.post('/api/init', async (req: Request, res: Response) => {
  try {
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS requests (
        id SERIAL PRIMARY KEY,
        method VARCHAR(10),
        path VARCHAR(255),
        status_code INT,
        response_time_ms INT,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS metrics (
        id SERIAL PRIMARY KEY,
        metric_name VARCHAR(255),
        metric_value FLOAT,
        tags JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at);
      CREATE INDEX IF NOT EXISTS idx_metrics_created_at ON metrics(created_at);
    `);

    res.json({ status: 'initialized' });
  } catch (error) {
    logger.error('Initialization error', error);
    res.status(500).json({ error: 'Initialization failed' });
  }
});

// Example API endpoint
app.get('/api/echo', (req: Request, res: Response) => {
  const message = req.query.message || 'Hello, World!';
  res.json({
    message,
    requestId: req.id,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Not Found',
    path: req.path,
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  try {
    await redisClient.quit();
    await pgPool.end();
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', error);
    process.exit(1);
  }
});

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

export default app;
