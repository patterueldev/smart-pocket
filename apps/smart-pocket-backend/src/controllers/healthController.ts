import { Request, Response } from 'express';

interface HealthResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

class HealthController {
  name: string = 'HealthController';

  check(req: Request, res: Response<HealthResponse>): void {
    res.status(200).json({
      success: true,
      message: 'Service is healthy',
      timestamp: new Date().toISOString(),
    });
  }
}

export default HealthController;
