import { Request, Response } from 'express';

interface HealthResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

class HealthController {
  name: string = 'HealthController v1.0.0';

  check(req: Request, res: Response<HealthResponse>): void {
    res.status(200).json({
      success: true,
      message: 'Service is healthy - Hot reload working great!',
      timestamp: new Date().toISOString(),
    });
  }
}

export default HealthController;
