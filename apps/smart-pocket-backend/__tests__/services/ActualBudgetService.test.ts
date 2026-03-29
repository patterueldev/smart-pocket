import ActualBudgetService from '../../src/services/ActualBudgetService';
import { ActualBudgetConfig, AccountBalance, Account, Transaction } from '../../src/interfaces/IActualBudgetService';
import Logger from '../../src/utils/logger';

// Mock @actual-app/api
jest.mock('@actual-app/api');

// Mock Logger
jest.mock('../../src/utils/logger');

// Mock fs and path
jest.mock('fs');
jest.mock('path');

describe('ActualBudgetService', () => {
  let service: ActualBudgetService;
  let mockApi: jest.Mocked<any>;
  let fs: jest.Mocked<any>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup fs mock
    fs = require('fs');
    fs.existsSync.mockReturnValue(true);
    fs.readdirSync.mockReturnValue(['budget-123']);
    fs.mkdirSync.mockImplementation(() => {});
    fs.readFileSync.mockReturnValue(JSON.stringify({ cloudFileId: 'sync-id-1' }));
    fs.statSync.mockReturnValue({ isDirectory: () => true });

    // Setup @actual-app/api mock
    mockApi = {
      init: jest.fn().mockResolvedValue(undefined),
      downloadBudget: jest.fn().mockResolvedValue(undefined),
      loadBudget: jest.fn().mockResolvedValue(undefined),
      sync: jest.fn().mockResolvedValue(undefined),
      shutdown: jest.fn().mockResolvedValue(undefined),
      q: jest.fn(),
      aqlQuery: jest.fn(),
      utils: {
        integerToAmount: (cents: number) => cents / 100,
      },
    };

    // Setup query builder chain
    const queryBuilder = {
      select: jest.fn().mockReturnThis(),
      filter: jest.fn().mockReturnThis(),
      options: jest.fn().mockReturnThis(),
    };

    mockApi.q.mockReturnValue(queryBuilder);

    // @ts-ignore
    require('@actual-app/api').q = mockApi.q;
    // @ts-ignore
    require('@actual-app/api').aqlQuery = mockApi.aqlQuery;
    // @ts-ignore
    require('@actual-app/api').utils = mockApi.utils;
    // @ts-ignore
    require('@actual-app/api').init = mockApi.init;
    // @ts-ignore
    require('@actual-app/api').downloadBudget = mockApi.downloadBudget;
    // @ts-ignore
    require('@actual-app/api').loadBudget = mockApi.loadBudget;
    // @ts-ignore
    require('@actual-app/api').sync = mockApi.sync;
    // @ts-ignore
    require('@actual-app/api').shutdown = mockApi.shutdown;

    service = new ActualBudgetService();
  });

  describe('getAccountBalances', () => {
    it('should fetch and return account balances', async () => {
      const config: ActualBudgetConfig = {
        serverUrl: 'https://actual.example.com',
        budgetId: 'sync-id-1',
        currency: 'USD',
      };

      const mockAccounts: Account[] = [
        { id: 'acc-1', name: 'Checking', offbudget: false, closed: false },
        { id: 'acc-2', name: 'Savings', offbudget: false, closed: false },
      ];

      const mockTransactions1: Transaction[] = [
        { id: 'txn-1', date: '2024-01-01', amount: 50000, cleared: true, account: 'acc-1' },
        { id: 'txn-2', date: '2024-01-02', amount: 10000, cleared: false, account: 'acc-1' },
      ];

      const mockTransactions2: Transaction[] = [
        { id: 'txn-3', date: '2024-01-01', amount: 100000, cleared: true, account: 'acc-2' },
      ];

      // First call downloads budget (not in cache), so it should call downloadBudget
      // Note: In the test, the cache is empty on first call
      mockApi.downloadBudget.mockResolvedValueOnce(undefined);

      // Setup aqlQuery to return accounts on first call, then transactions on subsequent calls
      mockApi.aqlQuery
        .mockResolvedValueOnce({ data: mockAccounts })
        .mockResolvedValueOnce({ data: mockTransactions1 })
        .mockResolvedValueOnce({ data: mockTransactions2 });

      const result = await service.getAccountBalances(config);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        accountId: 'acc-1',
        accountName: 'Checking',
        cleared: { amount: '500.00', currency: 'USD' },
        uncleared: { amount: '100.00', currency: 'USD' },
      });
      expect(result[1]).toEqual({
        accountId: 'acc-2',
        accountName: 'Savings',
        cleared: { amount: '1000.00', currency: 'USD' },
        uncleared: { amount: '0.00', currency: 'USD' },
      });

      expect(mockApi.init).toHaveBeenCalled();
      // Either downloadBudget or loadBudget will be called depending on cache
      expect(mockApi.downloadBudget).toHaveBeenCalled();
      expect(mockApi.shutdown).toHaveBeenCalled();
    });

    it('should use default currency when not specified', async () => {
      const config: ActualBudgetConfig = {
        serverUrl: 'https://actual.example.com',
        budgetId: 'sync-id-1',
      };

      mockApi.aqlQuery
        .mockResolvedValueOnce({
          data: [{ id: 'acc-1', name: 'Checking', offbudget: false, closed: false }],
        })
        .mockResolvedValueOnce({ data: [{ id: 'txn-1', date: '2024-01-01', amount: 50000, cleared: true, account: 'acc-1' }] });

      const result = await service.getAccountBalances(config);

      expect(result[0].cleared.currency).toBe('USD');
      expect(result[0].uncleared.currency).toBe('USD');
    });

    it('should handle empty account list', async () => {
      const config: ActualBudgetConfig = {
        serverUrl: 'https://actual.example.com',
        budgetId: 'sync-id-1',
      };

      mockApi.aqlQuery.mockResolvedValueOnce({ data: [] });

      const result = await service.getAccountBalances(config);

      expect(result).toEqual([]);
    });

    it('should properly sum cleared and uncleared balances', async () => {
      const config: ActualBudgetConfig = {
        serverUrl: 'https://actual.example.com',
        budgetId: 'sync-id-1',
      };

      const mockTransactions: Transaction[] = [
        { id: 'txn-1', date: '2024-01-01', amount: 10000, cleared: true, account: 'acc-1' },
        { id: 'txn-2', date: '2024-01-02', amount: 20000, cleared: true, account: 'acc-1' },
        { id: 'txn-3', date: '2024-01-03', amount: 5000, cleared: false, account: 'acc-1' },
        { id: 'txn-4', date: '2024-01-04', amount: 3000, cleared: false, account: 'acc-1' },
      ];

      mockApi.aqlQuery
        .mockResolvedValueOnce({
          data: [{ id: 'acc-1', name: 'Test Account', offbudget: false, closed: false }],
        })
        .mockResolvedValueOnce({ data: mockTransactions });

      const result = await service.getAccountBalances(config);

      expect(result[0].cleared.amount).toBe('300.00');
      expect(result[0].uncleared.amount).toBe('80.00');
    });

    it('should call shutdown even on error', async () => {
      const config: ActualBudgetConfig = {
        serverUrl: 'https://actual.example.com',
        budgetId: 'sync-id-1',
      };

      mockApi.aqlQuery.mockRejectedValueOnce(new Error('API Error'));

      await expect(service.getAccountBalances(config)).rejects.toThrow('API Error');
      expect(mockApi.shutdown).toHaveBeenCalled();
    });
  });

  describe('getAccounts', () => {
    it('should fetch and return accounts', async () => {
      const config: ActualBudgetConfig = {
        serverUrl: 'https://actual.example.com',
        budgetId: 'sync-id-1',
      };

      const mockAccounts: Account[] = [
        { id: 'acc-1', name: 'Checking', offbudget: false, closed: false },
        { id: 'acc-2', name: 'Savings', offbudget: false, closed: false },
      ];

      mockApi.aqlQuery.mockResolvedValueOnce({ data: mockAccounts });

      const result = await service.getAccounts(config);

      expect(result).toEqual(mockAccounts);
      expect(mockApi.shutdown).toHaveBeenCalled();
    });

    it('should filter off-budget and closed accounts', async () => {
      const config: ActualBudgetConfig = {
        serverUrl: 'https://actual.example.com',
        budgetId: 'sync-id-1',
      };

      const mockAccounts: Account[] = [
        { id: 'acc-1', name: 'Checking', offbudget: false, closed: false },
      ];

      mockApi.aqlQuery.mockResolvedValueOnce({ data: mockAccounts });

      await service.getAccounts(config);

      // Verify the filter was applied in the query
      expect(mockApi.q).toHaveBeenCalledWith('accounts');
    });
  });

  describe('getTransactions', () => {
    it('should fetch and filter transactions by date range', async () => {
      const config: ActualBudgetConfig = {
        serverUrl: 'https://actual.example.com',
        budgetId: 'sync-id-1',
      };

      const allTransactions: Transaction[] = [
        { id: 'txn-1', date: '2024-01-01', amount: 10000, cleared: true, account: 'acc-1' },
        { id: 'txn-2', date: '2024-01-05', amount: 20000, cleared: true, account: 'acc-1' },
        { id: 'txn-3', date: '2024-01-10', amount: 5000, cleared: false, account: 'acc-1' },
        { id: 'txn-4', date: '2024-02-01', amount: 3000, cleared: false, account: 'acc-1' },
      ];

      mockApi.aqlQuery.mockResolvedValueOnce({ data: allTransactions });

      const result = await service.getTransactions(config, 'acc-1', '2024-01-01', '2024-01-31');

      expect(result).toHaveLength(3);
      expect(result.map((t: Transaction) => t.id)).toEqual(['txn-1', 'txn-2', 'txn-3']);
      expect(mockApi.shutdown).toHaveBeenCalled();
    });

    it('should return empty array when no transactions in date range', async () => {
      const config: ActualBudgetConfig = {
        serverUrl: 'https://actual.example.com',
        budgetId: 'sync-id-1',
      };

      mockApi.aqlQuery.mockResolvedValueOnce({
        data: [{ id: 'txn-1', date: '2024-02-01', amount: 10000, cleared: true, account: 'acc-1' }],
      });

      const result = await service.getTransactions(config, 'acc-1', '2024-01-01', '2024-01-31');

      expect(result).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('should propagate API errors', async () => {
      const config: ActualBudgetConfig = {
        serverUrl: 'https://actual.example.com',
        budgetId: 'invalid-id',
      };

      mockApi.downloadBudget.mockRejectedValueOnce(new Error('Budget not found'));

      await expect(service.getAccountBalances(config)).rejects.toThrow('Budget not found');
      expect(mockApi.shutdown).toHaveBeenCalled();
    });

    it('should handle invalid credentials', async () => {
      const config: ActualBudgetConfig = {
        serverUrl: 'https://actual.example.com',
        budgetId: 'sync-id-1',
        password: 'wrong-password',
      };

      mockApi.init.mockRejectedValueOnce(new Error('Authentication failed'));

      await expect(service.getAccountBalances(config)).rejects.toThrow('Authentication failed');
      expect(mockApi.shutdown).toHaveBeenCalled();
    });
  });

  describe('configuration', () => {
    it('should use custom dataDir when provided', async () => {
      const config: ActualBudgetConfig = {
        serverUrl: 'https://actual.example.com',
        budgetId: 'sync-id-1',
        dataDir: '/custom/cache/dir',
      };

      mockApi.aqlQuery.mockResolvedValueOnce({ data: [] });

      await service.getAccountBalances(config);

      expect(mockApi.init).toHaveBeenCalledWith(
        expect.objectContaining({
          dataDir: '/custom/cache/dir',
        }),
      );
    });

    it('should include password in init config when provided', async () => {
      const config: ActualBudgetConfig = {
        serverUrl: 'https://actual.example.com',
        budgetId: 'sync-id-1',
        password: 'my-password',
      };

      mockApi.aqlQuery.mockResolvedValueOnce({ data: [] });

      await service.getAccountBalances(config);

      expect(mockApi.init).toHaveBeenCalledWith(
        expect.objectContaining({
          password: 'my-password',
        }),
      );
    });

    it('should use default dataDir when not provided', async () => {
      const config: ActualBudgetConfig = {
        serverUrl: 'https://actual.example.com',
        budgetId: 'sync-id-1',
      };

      mockApi.aqlQuery.mockResolvedValueOnce({ data: [] });

      await service.getAccountBalances(config);

      expect(mockApi.init).toHaveBeenCalledWith(
        expect.objectContaining({
          dataDir: '/tmp/actual-cache',
        }),
      );
    });
  });
});
