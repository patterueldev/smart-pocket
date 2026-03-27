import { Router, Request, Response } from 'express';
import HealthController from '../controllers/healthController';

const router = Router();
const healthController = new HealthController();

router.get('/', (req: Request, res: Response) => {
  healthController.check(req, res);
});

export default router;
