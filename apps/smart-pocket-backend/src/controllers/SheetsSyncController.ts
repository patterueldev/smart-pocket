import { Request, Response } from 'express';
import Logger from '../utils/logger';
import ActualBudgetService from '../services/ActualBudgetService';
import GoogleSheetsService from '../services/GoogleSheetsService';
import SheetsSyncService from '../services/SheetsSync/SheetsSyncService';
import config from '../config/env';
import { ISheetsSyncController } from '../interfaces/ISheetsSyncController';
import {
  CreateDraftRequest,
  CreateDraftResponse,
  ExecuteSyncRequest,
  ExecuteSyncResponse,
} from '../models/sheets-sync';
import { ActualBudgetConfig } from '../interfaces/IActualBudgetService';
import { GoogleSheetsConfig } from '../interfaces/IGoogleSheetsService';
import { PendingChange } from '../interfaces/ISheetsSync';

const logger = new Logger();

class SheetsSyncController implements ISheetsSyncController {
  constructor(
    private actualBudgetService: ActualBudgetService,
    private googleSheetsService: GoogleSheetsService,
    private sheetsSyncService: SheetsSyncService
  ) {}

  async createDraft(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Creating sheets sync draft');

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
      logger.info(`Fetched ${actualBalances.length} account balances from Actual Budget`);

      // Fetch last synced balances from Google Sheets
      const googleSheetsConfig: GoogleSheetsConfig = {
        credentialsPath: config.googleCredentialsPath,
        sheetId: config.googleSheetId,
        sheetName: config.googleSheetName,
        currency: config.defaultCurrency,
      };

      const sheetBalances =
        await this.googleSheetsService.getLastSyncedBalances(googleSheetsConfig);
      logger.info(`Fetched ${sheetBalances.length} account balances from Google Sheets`);

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
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error && error.stack ? error.stack : JSON.stringify(error);
      logger.warn('Error creating draft', {
        errorMessage,
        errorStack: errorStack || 'Unknown stack',
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

      logger.info('Executing sheets sync from draft', { draftId });

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
      logger.warn('Error executing sync', {
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
