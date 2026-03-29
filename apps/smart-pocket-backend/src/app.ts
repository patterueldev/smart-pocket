import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';

import config from './config/env';
import container from './container';
import { Logger } from './utils/logger';
import requestLogger from './middleware/requestLogger';
import errorHandler from './middleware/errorHandler';
import healthRoutes from './routes/health';
import authRoutes from './routes/auth';

interface NotFoundResponse {
  success: boolean;
  message: string;
  path: string;
}

class App {
  private app: Express;
  private logger: Logger;

  constructor() {
    this.logger = container.get<Logger>('logger');
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
    this.app.use('/health', healthRoutes);
    this.app.use('/auth', authRoutes);

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
    const PORT = config.port;
    this.app.listen(PORT, () => {
      this.logger.info(`Server running on port ${PORT}`, {
        environment: config.nodeEnv,
      });
    });
  }
}

export default App;
