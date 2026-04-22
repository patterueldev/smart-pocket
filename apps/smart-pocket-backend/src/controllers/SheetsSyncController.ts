import { Request, Response } from 'express';
import { ILogger } from '../utils/logger';
import { IActualBudgetService, ActualBudgetConfig } from '../interfaces/IActualBudgetService';
import { IGoogleSheetsService, GoogleSheetsConfig } from '../interfaces/IGoogleSheetsService';
import { ISheetsSync, PendingChange } from '../interfaces/ISheetsSync';
import config from '../config/env';
import { ISheetsSyncController } from '../interfaces/ISheetsSyncController';
import {
  CreateDraftRequest,
  CreateDraftResponse,
  ExecuteSyncRequest,
  ExecuteSyncResponse,
} from '../models/sheets-sync';

class SheetsSyncController implements ISheetsSyncController {
  constructor(
    private actualBudgetService: IActualBudgetService,
    private googleSheetsService: IGoogleSheetsService,
    private sheetsSyncService: ISheetsSync,
    private logger: ILogger
  ) {}

  async createDraft(req: Request, res: Response): Promise<void> {
    try {
      this.logger.info('Creating sheets sync draft');

      // Get Actual Budget config from request or environment
      const actualBudgetServerUrl =
        (req.body as CreateDraftRequest)?.actualBudgetServerUrl || config.actualBudgetServerUrl;
      const actualBudgetPassword =
        (req.body as CreateDraftRequest)?.actualBudgetPassword || config.actualBudgetPassword;
      const actualBudgetId =
        (req.body as CreateDraftRequest)?.actualBudgetId || config.actualBudgetId;

      // Validate required Actual Budget config
      if (!actualBudgetServerUrl || !actualBudgetId) {
        res.status(400).json({
          success: false,
          error: 'Missing Actual Budget configuration (serverUrl, budgetId)',
          draftId: '',
          summary: { totalAccounts: 0, newAccounts: 0, updatedAccounts: 0, unchangedAccounts: 0 },
          pendingChanges: [],
          timestamp: new Date().toISOString(),
        } as CreateDraftResponse);
        return;
      }

      // Validate Google Sheets config
      if (!config.googleSheetId || !config.googleCredentialsPath) {
        res.status(400).json({
          success: false,
          error: 'Missing Google Sheets configuration (sheetId, credentialsPath)',
          draftId: '',
          summary: { totalAccounts: 0, newAccounts: 0, updatedAccounts: 0, unchangedAccounts: 0 },
          pendingChanges: [],
          timestamp: new Date().toISOString(),
        } as CreateDraftResponse);
        return;
      }

      // Fetch actual budget balances
      const actualBudgetConfig: ActualBudgetConfig = {
        serverUrl: actualBudgetServerUrl,
        budgetId: actualBudgetId,
        password: actualBudgetPassword,
        currency: config.defaultCurrency,
      };

      const actualBalances = await this.actualBudgetService.getAccountBalances(actualBudgetConfig);
      this.logger.info(`Fetched ${actualBalances.length} account balances from Actual Budget`);

      // Fetch last synced balances from Google Sheets
      const googleSheetsConfig: GoogleSheetsConfig = {
        credentialsPath: config.googleCredentialsPath,
        sheetId: config.googleSheetId,
        sheetName: config.googleSheetName,
        currency: config.defaultCurrency,
      };

      const sheetBalances =
        await this.googleSheetsService.getLastSyncedBalances(googleSheetsConfig);
      this.logger.info(`Fetched ${sheetBalances.length} account balances from Google Sheets`);

      // Create draft
      const draft = await this.sheetsSyncService.createDraft(actualBalances, sheetBalances);

      const response: CreateDraftResponse = {
        success: true,
        draftId: draft.id,
        summary: draft.summary,
        pendingChanges: draft.pendingChanges,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      // Log detailed error information
      let errorMessage = '';
      let errorType = '';
      let errorCode = '';
      let errorDetails: Record<string, unknown> = {};
      
      if (error instanceof Error) {
        errorMessage = error.message;
        errorType = 'Error';
        errorDetails = {
          message: error.message,
          stack: error.stack,
        };
      } else if (error && typeof error === 'object') {
        // Handle plain objects (like APIError from Actual Budget)
        const err = error as Record<string, unknown>;
        errorType = typeof err.type === 'string' ? err.type : 'Object';
        errorCode = typeof err.code === 'string' ? err.code : '';
        errorMessage = err.message ? String(err.message) : JSON.stringify(error);
        
        // Build details from object properties
        errorDetails = {
          type: errorType,
          message: errorMessage,
        };
        if (errorCode) {
          errorDetails.code = errorCode;
        }
      } else {
        errorMessage = String(error);
        errorType = typeof error;
        errorDetails = { error: errorMessage };
      }

      this.logger.warn('Error creating draft', {
        errorMessage,
        errorType,
        ...errorDetails,
      });

      const response: CreateDraftResponse = {
        success: false,
        error: errorMessage || 'Failed to create draft',
        draftId: '',
        summary: { totalAccounts: 0, newAccounts: 0, updatedAccounts: 0, unchangedAccounts: 0 },
        pendingChanges: [],
        timestamp: new Date().toISOString(),
      };

      res.status(500).json(response);
    }
  }

  async executeSync(req: Request, res: Response): Promise<void> {
    try {
      const { draftId } = req.body as ExecuteSyncRequest;

      if (!draftId) {
        res.status(400).json({
          success: false,
          error: 'Missing draftId',
          syncedAt: new Date().toISOString(),
          accountsUpdated: 0,
        } as ExecuteSyncResponse);
        return;
      }

      this.logger.info('Executing sheets sync from draft', { draftId });

      // Get draft to validate it exists
      const draft = await this.sheetsSyncService.getDraft(draftId);
      if (!draft) {
        res.status(404).json({
          success: false,
          error: 'Draft not found or has expired',
          syncedAt: new Date().toISOString(),
          accountsUpdated: 0,
        } as ExecuteSyncResponse);
        return;
      }

      // Validate Google Sheets config
      if (!config.googleSheetId || !config.googleCredentialsPath) {
        res.status(500).json({
          success: false,
          error: 'Missing Google Sheets configuration',
          syncedAt: new Date().toISOString(),
          accountsUpdated: 0,
        } as ExecuteSyncResponse);
        return;
      }

      // Get accounts to sync from draft
      const accountsToSync = draft.pendingChanges
        .map((change: PendingChange) => {
          const account = draft.allAccounts.find((a: any) => a.accountName === change.accountName);
          return account;
        })
        .filter((account: any) => account !== undefined);

      // Convert to SheetBalance format for update
      const balancesToUpdate = accountsToSync.map((account: any) => ({
        accountName: account!.accountName,
        cleared: account!.cleared,
        uncleared: account!.uncleared,
      }));

      // Update Google Sheets
      const googleSheetsConfig: GoogleSheetsConfig = {
        credentialsPath: config.googleCredentialsPath,
        sheetId: config.googleSheetId,
        sheetName: config.googleSheetName,
        currency: config.defaultCurrency,
      };

      const updateResult = await this.googleSheetsService.updateBalances(
        googleSheetsConfig,
        balancesToUpdate
      );

      // Execute sync (removes draft)
      const syncResult = await this.sheetsSyncService.executeSyncFromDraft(draftId);

      if (!syncResult.success) {
        res.status(500).json({
          success: false,
          error: syncResult.errorMessage || 'Failed to execute sync',
          syncedAt: new Date().toISOString(),
          accountsUpdated: 0,
        } as ExecuteSyncResponse);
        return;
      }

      const response: ExecuteSyncResponse = {
        success: true,
        syncedAt: updateResult.timestamp,
        accountsUpdated: updateResult.rowsUpdated,
        message: `Successfully synced ${updateResult.rowsUpdated} account(s)`,
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.warn('Error executing sync', {
        errorMessage: error instanceof Error ? error.message : String(error),
      });

      const response: ExecuteSyncResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to execute sync',
        syncedAt: new Date().toISOString(),
        accountsUpdated: 0,
      };

      res.status(500).json(response);
    }
  }
}

export default SheetsSyncController;
