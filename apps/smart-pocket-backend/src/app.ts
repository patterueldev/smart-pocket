import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';

import config from './config/env';
import container from './container';
import { ILogger } from './utils/logger';
import requestLogger from './middleware/requestLogger';
import errorHandler from './middleware/errorHandler';
import healthRoutes from './routes/health';
import authRoutes from './routes/auth';
import createSheetsSyncRoutes from './routes/sheets-sync';
import { ISheetsSyncController } from './interfaces/ISheetsSyncController';

interface NotFoundResponse {
  success: boolean;
  message: string;
  path: string;
}

class App {
  private app: Express;
  private logger: ILogger;

  constructor() {
    this.logger = container.get<ILogger>('logger');
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(requestLogger);
  }

  private setupRoutes(): void {
    // API routes at root level (no /api/ prefix)
    // Frontend configures API base URL as https://smartpocketapi-dev.nicenature.space
    // so routes are at root: /health, /auth/setup, /sheets-sync/draft, etc.
    this.app.use('/health', healthRoutes);
    this.app.use('/auth', authRoutes);

    // Mount sheets-sync routes
    const sheetsSyncController = container.get<ISheetsSyncController>('sheetsSyncController');
    this.app.use('/sheets-sync', createSheetsSyncRoutes(sheetsSyncController));

    this.app.use((req: Request, res: Response<NotFoundResponse>) => {
      res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.path,
      });
    });

    this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      errorHandler.handle(err as any, req, res, next);
    });
  }

  getApp(): Express {
    return this.app;
  }

  start(): void {
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: unknown) => {
      const errorMessage = reason instanceof Error ? reason.message : String(reason);
      const errorStack = reason instanceof Error && reason.stack ? reason.stack : JSON.stringify(reason);
      this.logger.warn('Unhandled promise rejection', {
        message: errorMessage,
        stack: errorStack,
      });
      // Don't exit - log but continue running to serve other requests
    });

    const PORT = config.port;
    this.app.listen(PORT, () => {
      this.logger.info(`Server running on port ${PORT}`, {
        environment: config.nodeEnv,
      });
    });
  }
}

export default App;
