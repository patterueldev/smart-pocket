import { Router, Request, Response, NextFunction } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import {
  validateCreateDraftRequest,
  validateExecuteSyncRequest,
} from '../middleware/validateSheetsSyncRequest';
import { ISheetsSyncController } from '../interfaces/ISheetsSyncController';
import { CreateDraftRequest, CreateDraftResponse, ExecuteSyncRequest, ExecuteSyncResponse } from '../models/sheets-sync';

function createSheetsSyncRoutes(controller: ISheetsSyncController): Router {
  const router = Router();

  // Error handling wrapper for async handlers
  const asyncHandler = (
    fn: (req: Request, res: Response) => Promise<void>
  ) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res)).catch(next);
  };

  // POST /sheets-sync/draft - Create a draft of pending changes
  router.post(
    '/draft',
    authMiddleware,
    validateCreateDraftRequest,
    asyncHandler((req: Request<unknown, unknown, CreateDraftRequest>, res: Response<CreateDraftResponse>) =>
      controller.createDraft(req, res)
    )
  );

  // POST /sheets-sync/sync - Execute sync from approved draft
  router.post(
    '/sync',
    authMiddleware,
    validateExecuteSyncRequest,
    asyncHandler((req: Request<unknown, unknown, ExecuteSyncRequest>, res: Response<ExecuteSyncResponse>) =>
      controller.executeSync(req, res)
    )
  );

  return router;
}

export default createSheetsSyncRoutes;
