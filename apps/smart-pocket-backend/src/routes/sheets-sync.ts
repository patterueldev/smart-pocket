import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import {
  validateCreateDraftRequest,
  validateExecuteSyncRequest,
} from '../middleware/validateSheetsSyncRequest';
import SheetsSyncController from '../controllers/SheetsSyncController';

function createSheetsSyncRoutes(controller: SheetsSyncController): Router {
  const router = Router();

  // Error handling wrapper for async handlers
  const asyncHandler =
    (fn: (req: any, res: any) => Promise<void>) => (req: any, res: any, next: any) => {
      Promise.resolve(fn(req, res)).catch(next);
    };

  // POST /sheets-sync/draft - Create a draft of pending changes
  router.post(
    '/draft',
    authMiddleware,
    validateCreateDraftRequest,
    asyncHandler((req, res) => controller.createDraft(req, res))
  );

  // POST /sheets-sync/sync - Execute sync from approved draft
  router.post(
    '/sync',
    authMiddleware,
    validateExecuteSyncRequest,
    asyncHandler((req, res) => controller.executeSync(req, res))
  );

  return router;
}

export default createSheetsSyncRoutes;
