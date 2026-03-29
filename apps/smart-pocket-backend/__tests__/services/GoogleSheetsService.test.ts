import GoogleSheetsService from '../../src/services/GoogleSheetsService';
import { GoogleSheetsConfig, SheetBalance } from '../../src/interfaces/IGoogleSheetsService';
import Logger from '../../src/utils/logger';

// Mock googleapis
jest.mock('googleapis');

// Mock Logger
jest.mock('../../src/utils/logger');

// Mock fs
jest.mock('fs');

describe('GoogleSheetsService', () => {
  let service: GoogleSheetsService;
  let mockSheets: jest.Mocked<any>;
  let mockFs: jest.Mocked<any>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup fs mock
    mockFs = require('fs');
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(JSON.stringify({
      type: 'service_account',
      project_id: 'test-project',
      private_key: 'test-key',
      client_email: 'test@example.com',
    }));

    // Setup sheets API mock
    mockSheets = {
      spreadsheets: {
        values: {
          get: jest.fn(),
          update: jest.fn(),
          append: jest.fn(),
          batchUpdate: jest.fn(),
        },
      },
    };

    // Mock googleapis
    const { google } = require('googleapis');
    google.auth.GoogleAuth = jest.fn().mockImplementation(() => ({}));
    google.sheets = jest.fn().mockReturnValue(mockSheets);

    service = new GoogleSheetsService();
  });

  describe('getLastSyncedBalances', () => {
    it('should read and parse balances from Google Sheets', async () => {
      const config: GoogleSheetsConfig = {
        credentialsPath: '/path/to/creds.json',
        sheetId: 'sheet-id-123',
        sheetName: 'Accounts',
        currency: 'USD',
      };

      mockSheets.spreadsheets.values.get.mockResolvedValueOnce({
        data: {
          values: [
            ['Checking', '1500.00', '100.00', '03/15/2024'],
            ['Savings', '5000.00', '0.00', '03/15/2024'],
            ['Credit Card', '0.00', '250.00', '03/10/2024'],
          ],
        },
      });

      const result = await service.getLastSyncedBalances(config);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        accountName: 'Checking',
        cleared: { amount: '1500.00', currency: 'USD' },
        uncleared: { amount: '100.00', currency: 'USD' },
        lastSyncedAt: expect.stringMatching(/2024-03-15/),
      });
      expect(result[1]).toEqual({
        accountName: 'Savings',
        cleared: { amount: '5000.00', currency: 'USD' },
        uncleared: { amount: '0.00', currency: 'USD' },
        lastSyncedAt: expect.stringMatching(/2024-03-15/),
      });
    });

    it('should handle empty sheet', async () => {
      const config: GoogleSheetsConfig = {
        credentialsPath: '/path/to/creds.json',
        sheetId: 'sheet-id-123',
      };

      mockSheets.spreadsheets.values.get.mockResolvedValueOnce({
        data: {
          values: [],
        },
      });

      const result = await service.getLastSyncedBalances(config);

      expect(result).toEqual([]);
    });

    it('should skip rows with missing account names', async () => {
      const config: GoogleSheetsConfig = {
        credentialsPath: '/path/to/creds.json',
        sheetId: 'sheet-id-123',
      };

      mockSheets.spreadsheets.values.get.mockResolvedValueOnce({
        data: {
          values: [
            ['Checking', '1500.00', '100.00', '03/15/2024'],
            ['', '0.00', '0.00', ''],
            ['Savings', '5000.00', '0.00', '03/15/2024'],
          ],
        },
      });

      const result = await service.getLastSyncedBalances(config);

      expect(result).toHaveLength(2);
      expect(result.map((b) => b.accountName)).toEqual(['Checking', 'Savings']);
    });

    it('should use default sheet name when not provided', async () => {
      const config: GoogleSheetsConfig = {
        credentialsPath: '/path/to/creds.json',
        sheetId: 'sheet-id-123',
      };

      mockSheets.spreadsheets.values.get.mockResolvedValueOnce({
        data: { values: [] },
      });

      await service.getLastSyncedBalances(config);

      expect(mockSheets.spreadsheets.values.get).toHaveBeenCalledWith(
        expect.objectContaining({
          range: expect.stringContaining('Accounts!A2:D'),
        }),
      );
    });

    it('should use default currency when not provided', async () => {
      const config: GoogleSheetsConfig = {
        credentialsPath: '/path/to/creds.json',
        sheetId: 'sheet-id-123',
      };

      mockSheets.spreadsheets.values.get.mockResolvedValueOnce({
        data: {
          values: [['Checking', '1500.00', '100.00', '03/15/2024']],
        },
      });

      const result = await service.getLastSyncedBalances(config);

      expect(result[0].cleared.currency).toBe('USD');
    });

    it('should handle missing date in sheet', async () => {
      const config: GoogleSheetsConfig = {
        credentialsPath: '/path/to/creds.json',
        sheetId: 'sheet-id-123',
      };

      mockSheets.spreadsheets.values.get.mockResolvedValueOnce({
        data: {
          values: [['Checking', '1500.00', '100.00', '']],
        },
      });

      const result = await service.getLastSyncedBalances(config);

      expect(result[0].lastSyncedAt).toBeUndefined();
    });

    it('should throw error if credentials file not found', async () => {
      mockFs.existsSync.mockReturnValue(false);

      const config: GoogleSheetsConfig = {
        credentialsPath: '/nonexistent/path.json',
        sheetId: 'sheet-id-123',
      };

      await expect(service.getLastSyncedBalances(config)).rejects.toThrow('not found');
    });
  });

  describe('updateBalances', () => {
    it('should update existing accounts in Google Sheets', async () => {
      const config: GoogleSheetsConfig = {
        credentialsPath: '/path/to/creds.json',
        sheetId: 'sheet-id-123',
        sheetName: 'Accounts',
      };

      const balances: SheetBalance[] = [
        {
          accountName: 'Checking',
          cleared: { amount: '2000.00', currency: 'USD' },
          uncleared: { amount: '150.00', currency: 'USD' },
        },
      ];

      // First call for reading existing accounts
      mockSheets.spreadsheets.values.get.mockResolvedValueOnce({
        data: {
          values: [
            ['Checking'],
            ['Savings'],
          ],
        },
      });

      // Call to update
      mockSheets.spreadsheets.values.update.mockResolvedValueOnce({
        data: {},
      });

      const result = await service.updateBalances(config, balances);

      expect(result.rowsUpdated).toBe(1);
      expect(result.timestamp).toBeDefined();

      expect(mockSheets.spreadsheets.values.update).toHaveBeenCalledWith(
        expect.objectContaining({
          spreadsheetId: 'sheet-id-123',
          range: expect.stringContaining('B2:D2'),
          valueInputOption: 'USER_ENTERED',
          requestBody: expect.objectContaining({
            values: expect.any(Array),
          }),
        }),
      );
    });

    it('should append new accounts to Google Sheets', async () => {
      const config: GoogleSheetsConfig = {
        credentialsPath: '/path/to/creds.json',
        sheetId: 'sheet-id-123',
      };

      const balances: SheetBalance[] = [
        {
          accountName: 'Investment Account',
          cleared: { amount: '10000.00', currency: 'USD' },
          uncleared: { amount: '0.00', currency: 'USD' },
        },
      ];

      // First call for reading existing accounts (empty)
      mockSheets.spreadsheets.values.get.mockResolvedValueOnce({
        data: {
          values: [],
        },
      });

      mockSheets.spreadsheets.values.append.mockResolvedValueOnce({
        data: {},
      });

      const result = await service.updateBalances(config, balances);

      expect(result.rowsUpdated).toBe(1);

      // Should append to A:D range
      expect(mockSheets.spreadsheets.values.append).toHaveBeenCalledWith(
        expect.objectContaining({
          spreadsheetId: 'sheet-id-123',
          range: expect.stringContaining('A:D'),
          valueInputOption: 'USER_ENTERED',
          requestBody: expect.objectContaining({
            values: expect.any(Array),
          }),
        }),
      );
    });

    it('should handle multiple updates in single batch', async () => {
      const config: GoogleSheetsConfig = {
        credentialsPath: '/path/to/creds.json',
        sheetId: 'sheet-id-123',
      };

      const balances: SheetBalance[] = [
        {
          accountName: 'Checking',
          cleared: { amount: '2000.00', currency: 'USD' },
          uncleared: { amount: '150.00', currency: 'USD' },
        },
        {
          accountName: 'Savings',
          cleared: { amount: '5000.00', currency: 'USD' },
          uncleared: { amount: '0.00', currency: 'USD' },
        },
      ];

      mockSheets.spreadsheets.values.get.mockResolvedValueOnce({
        data: {
          values: [['Checking'], ['Savings']],
        },
      });

      mockSheets.spreadsheets.values.update.mockResolvedValue({
        data: {},
      });

      const result = await service.updateBalances(config, balances);

      expect(result.rowsUpdated).toBe(2);

      // Should call update twice (once per balance)
      expect(mockSheets.spreadsheets.values.update).toHaveBeenCalledTimes(2);
    });

    it('should return 0 rows updated if no balances', async () => {
      const config: GoogleSheetsConfig = {
        credentialsPath: '/path/to/creds.json',
        sheetId: 'sheet-id-123',
      };

      mockSheets.spreadsheets.values.get.mockResolvedValueOnce({
        data: { values: [] },
      });

      const result = await service.updateBalances(config, []);

      expect(result.rowsUpdated).toBe(0);
      expect(mockSheets.spreadsheets.values.update).not.toHaveBeenCalled();
      expect(mockSheets.spreadsheets.values.append).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should throw error if credentials cannot be parsed', async () => {
      mockFs.readFileSync.mockReturnValue('invalid json');

      const config: GoogleSheetsConfig = {
        credentialsPath: '/path/to/creds.json',
        sheetId: 'sheet-id-123',
      };

      await expect(service.getLastSyncedBalances(config)).rejects.toThrow();
    });

    it('should propagate API errors', async () => {
      const config: GoogleSheetsConfig = {
        credentialsPath: '/path/to/creds.json',
        sheetId: 'invalid-sheet-id',
      };

      mockSheets.spreadsheets.values.get.mockRejectedValueOnce(
        new Error('Sheet not found'),
      );

      await expect(service.getLastSyncedBalances(config)).rejects.toThrow(
        'Sheet not found',
      );
    });
  });

  describe('date parsing', () => {
    it('should correctly parse MM/DD/YYYY dates', async () => {
      const config: GoogleSheetsConfig = {
        credentialsPath: '/path/to/creds.json',
        sheetId: 'sheet-id-123',
      };

      mockSheets.spreadsheets.values.get.mockResolvedValueOnce({
        data: {
          values: [
            ['Account', '100.00', '0.00', '01/15/2024'],
            ['Account2', '200.00', '0.00', '12/25/2023'],
          ],
        },
      });

      const result = await service.getLastSyncedBalances(config);

      expect(result[0].lastSyncedAt).toContain('2024-01-15');
      expect(result[1].lastSyncedAt).toContain('2023-12-25');
    });

    it('should handle invalid date formats', async () => {
      const config: GoogleSheetsConfig = {
        credentialsPath: '/path/to/creds.json',
        sheetId: 'sheet-id-123',
      };

      mockSheets.spreadsheets.values.get.mockResolvedValueOnce({
        data: {
          values: [['Account', '100.00', '0.00', 'invalid-date']],
        },
      });

      const result = await service.getLastSyncedBalances(config);

      expect(result[0].lastSyncedAt).toBeUndefined();
    });
  });
});
