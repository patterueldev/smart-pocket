import { google } from 'googleapis';
import * as fs from 'fs';
import Logger from '../utils/logger';
import {
  IGoogleSheetsService,
  GoogleSheetsConfig,
  SheetBalance,
  UpdateResult,
} from '../interfaces/IGoogleSheetsService';

interface SheetsClient {
  spreadsheets: {
    values: {
      get(params: { spreadsheetId: string; range: string }): Promise<{
        data: {
          values?: string[][];
        };
      }>;
      update(params: {
        spreadsheetId: string;
        range: string;
        valueInputOption: string;
        requestBody: {
          values: (string | number)[][];
        };
      }): Promise<{
        data: object;
      }>;
      append(params: {
        spreadsheetId: string;
        range: string;
        valueInputOption: string;
        requestBody: {
          values: (string | number)[][];
        };
      }): Promise<{
        data: object;
      }>;
      batchUpdate(params: {
        spreadsheetId: string;
        resource: {
          data: Array<{
            range: string;
            values: (string | number)[][];
          }>;
        };
      }): Promise<{
        data: object;
      }>;
    };
  };
}

const logger = new Logger();

/**
 * Google Sheets Service for Smart Pocket
 * Provides integration with Google Sheets API for syncing account balances
 */
class GoogleSheetsService implements IGoogleSheetsService {
  private sheetsApi: SheetsClient | null = null;

  /**
   * Get or initialize the Google Sheets API client
   */
  private async getClient(credentialsPath: string): Promise<SheetsClient> {
    if (this.sheetsApi) {
      return this.sheetsApi;
    }

    try {
      // Verify credentials file exists
      if (!fs.existsSync(credentialsPath)) {
        throw new Error(`Google credentials file not found at: ${credentialsPath}`);
      }

      // Load credentials
      const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

      // Create auth client
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      // Create sheets API client
      this.sheetsApi = google.sheets({ version: 'v4', auth }) as SheetsClient;
      logger.debug('Initialized Google Sheets API client');

      return this.sheetsApi;
    } catch (error) {
      logger.warn('Failed to initialize Google Sheets client', {
        errorMessage: error instanceof Error ? error.message : String(error),
        credentialsPath,
      });
      throw error;
    }
  }

  /**
   * Parse a date string from Google Sheets format (MM/DD/YYYY) to ISO 8601
   */
  private parseSheetDate(dateStr: string | undefined): string | undefined {
    if (!dateStr) {
      return undefined;
    }

    // Try to parse MM/DD/YYYY format
    const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!match) {
      return undefined;
    }

    const [, month, day, year] = match;
    const date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);

    if (isNaN(date.getTime())) {
      return undefined;
    }

    return date.toISOString();
  }

  /**
   * Format a date to Google Sheets format (MM/DD/YYYY)
   */
  private formatSheetDate(dateStr: string): string {
    const date = new Date(dateStr);
    const month = (date.getMonth() + 1).toString();
    const day = date.getDate().toString();
    const year = date.getFullYear();

    return `${month}/${day}/${year}`;
  }

  /**
   * Read current balances from Google Sheets
   */
  async getLastSyncedBalances(config: GoogleSheetsConfig): Promise<SheetBalance[]> {
    try {
      const client = await this.getClient(config.credentialsPath);
      const sheetName = config.sheetName || 'Accounts';
      const currency = config.currency || 'USD';

      logger.info('Fetching last synced balances from Google Sheets', {
        sheetId: config.sheetId,
        sheetName,
      });

      // Read data from sheet: columns A (name), B (cleared), C (uncleared), D (date)
      const response = await client.spreadsheets.values.get({
        spreadsheetId: config.sheetId,
        range: `${sheetName}!A2:D`,
      });

      const rows = response.data.values || [];
      logger.info(`Read ${rows.length} rows from sheet`);

      // Parse rows into balance objects
      const balances: SheetBalance[] = rows
        .filter((row) => row && row[0]) // Filter out empty rows
        .map((row) => ({
          accountName: row[0] || '',
          cleared: {
            amount: row[1] || '0.00',
            currency,
          },
          uncleared: {
            amount: row[2] || '0.00',
            currency,
          },
          lastSyncedAt: this.parseSheetDate(row[3]),
        }));

      return balances;
    } catch (error) {
      logger.warn('Failed to fetch balances from Google Sheets', {
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Update balances in Google Sheets
   */
  async updateBalances(
    config: GoogleSheetsConfig,
    balances: SheetBalance[]
  ): Promise<UpdateResult> {
    try {
      const client = await this.getClient(config.credentialsPath);
      const sheetName = config.sheetName || 'Accounts';
      const now = new Date().toISOString();

      logger.info('Updating balances in Google Sheets', {
        sheetId: config.sheetId,
        sheetName,
        accountCount: balances.length,
      });

      // Read all account names from sheet to find row numbers
      const response = await client.spreadsheets.values.get({
        spreadsheetId: config.sheetId,
        range: `${sheetName}!A2:A`,
      });

      const accountNames = response.data.values?.map((row) => row[0]) || [];
      let rowsUpdated = 0;

      // Update each balance
      for (const balance of balances) {
        const rowIndex = accountNames.findIndex(
          (name) => name === balance.accountName
        );

        if (rowIndex >= 0) {
          // Account exists in sheet, update it
          const excelRowNum = rowIndex + 2; // +1 for header, +1 for 0-based index
          const range = `${sheetName}!B${excelRowNum}:D${excelRowNum}`;
          const values = [
            [
              balance.cleared.amount,
              balance.uncleared.amount,
              this.formatSheetDate(now),
            ],
          ];

          await client.spreadsheets.values.update({
            spreadsheetId: config.sheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values },
          });

          rowsUpdated++;
        } else {
          // New account - append to sheet
          const appendRange = `${sheetName}!A:D`;
          const values = [
            [
              balance.accountName,
              balance.cleared.amount,
              balance.uncleared.amount,
              this.formatSheetDate(now),
            ],
          ];

          await client.spreadsheets.values.append({
            spreadsheetId: config.sheetId,
            range: appendRange,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values },
          });

          rowsUpdated++;
        }
      }

      logger.info('Successfully updated balances in Google Sheets', {
        rowsUpdated,
      });

      return {
        rowsUpdated,
        timestamp: now,
      };
    } catch (error) {
      logger.warn('Failed to update balances in Google Sheets', {
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}

export default GoogleSheetsService;
