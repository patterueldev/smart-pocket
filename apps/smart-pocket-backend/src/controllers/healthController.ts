import { Request, Response } from 'express';
import { Logger } from '../utils/logger';

interface HealthResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

class HealthController {
  name: string = 'HealthController v1.0.0';

  constructor(private logger: Logger) {}

  check(req: Request, res: Response<HealthResponse>): void {
    this.logger.info('Health check requested');
    res.status(200).json({
      success: true,
      message: 'Service is healthy - Hot reload working great!',
      timestamp: new Date().toISOString(),
    });
  }
}

export default HealthController;
