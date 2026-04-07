export interface ISheetsSyncController {
  createDraft(req: any, res: any): Promise<void>;
  executeSync(req: any, res: any): Promise<void>;
}
