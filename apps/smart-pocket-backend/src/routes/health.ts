import { Router, Request, Response } from 'express';
import HealthController from '../controllers/healthController';
import container from '../container';
import { Logger } from '../utils/logger';

const router = Router();

// Get dependencies from container
const logger = container.get<Logger>('logger');

// Instantiate controller with injected dependencies
const healthController = new HealthController(logger);

router.get('/', (req: Request, res: Response) => {
  healthController.check(req, res);
});

export default router;
