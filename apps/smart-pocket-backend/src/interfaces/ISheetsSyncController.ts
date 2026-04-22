import { Request, Response } from 'express';
import { CreateDraftRequest, CreateDraftResponse, ExecuteSyncRequest, ExecuteSyncResponse } from '../models/sheets-sync';

export interface ISheetsSyncController {
  createDraft(req: Request<unknown, unknown, CreateDraftRequest>, res: Response<CreateDraftResponse>): Promise<void>;
  executeSync(req: Request<unknown, unknown, ExecuteSyncRequest>, res: Response<ExecuteSyncResponse>): Promise<void>;
}
