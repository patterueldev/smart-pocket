import { renderHook, act } from '@testing-library/react';
import { useSheetsSync } from '@/hooks/useSheetsSync';
import { ServiceFactory } from '@/services/ServiceFactory';

jest.mock('@/services/ServiceFactory', () => ({
  ServiceFactory: {
    createServices: jest.fn(),
  },
}));

describe('useSheetsSync', () => {
  let mockSheetsSyncService: any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    mockSheetsSyncService = {
      createDraft: jest.fn(),
      executeSyncFromDraft: jest.fn(),
      hasPendingChanges: jest.fn(),
      getLastSyncTime: jest.fn(),
    };

    (ServiceFactory.createServices as jest.Mock).mockReturnValue({
      sheetsSync: mockSheetsSyncService,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with loading state', () => {
    mockSheetsSyncService.createDraft.mockResolvedValue(null);
    const { result } = renderHook(() => useSheetsSync(mockSheetsSyncService));

    expect(result.current.loading).toBe(true);
    expect(result.current.syncing).toBe(false);
    expect(result.current.refreshing).toBe(false);
    expect(result.current.draft).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should load draft on mount', async () => {
    const mockDraft = {
      draftId: 'draft-123',
      totalAccounts: 5,
      newAccounts: 1,
      updatedAccounts: 4,
      unchangedAccounts: 0,
      changes: [],
    };

    mockSheetsSyncService.createDraft.mockResolvedValue(mockDraft);

    const { result } = renderHook(() => useSheetsSync(mockSheetsSyncService));

    await act(async () => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current.draft).toEqual(mockDraft);
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(mockSheetsSyncService.createDraft).toHaveBeenCalledTimes(1);
  });

  it('should handle error on mount', async () => {
    const error = new Error('Failed to load');
    mockSheetsSyncService.createDraft.mockRejectedValue(error);

    const { result } = renderHook(() => useSheetsSync(mockSheetsSyncService));

    await act(async () => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current.draft).toBeNull();
    expect(result.current.error).toBe('Failed to load');
    expect(result.current.loading).toBe(false);
  });

  it('should refresh draft', async () => {
    const mockDraft = {
      draftId: 'draft-456',
      totalAccounts: 3,
      newAccounts: 0,
      updatedAccounts: 3,
      unchangedAccounts: 0,
      changes: [],
    };

    mockSheetsSyncService.createDraft.mockResolvedValue(mockDraft);

    const { result } = renderHook(() => useSheetsSync(mockSheetsSyncService));

    await act(async () => {
      jest.advanceTimersByTime(100);
    });

    mockSheetsSyncService.createDraft.mockClear();

    await act(async () => {
      await result.current.onRefresh();
      jest.advanceTimersByTime(100);
    });

    expect(mockSheetsSyncService.createDraft).toHaveBeenCalledTimes(1);
  });

  it('should debounce rapid refresh calls', async () => {
    mockSheetsSyncService.createDraft.mockResolvedValue({
      draftId: 'draft-789',
      totalAccounts: 2,
      newAccounts: 0,
      updatedAccounts: 2,
      unchangedAccounts: 0,
      changes: [],
    });

    const { result } = renderHook(() => useSheetsSync(mockSheetsSyncService));

    await act(async () => {
      jest.advanceTimersByTime(100);
    });

    mockSheetsSyncService.createDraft.mockClear();

    await act(async () => {
      result.current.onRefresh();
      result.current.onRefresh();
      result.current.onRefresh();
      jest.advanceTimersByTime(100);
    });

    // Only first call should execute
    expect(mockSheetsSyncService.createDraft).toHaveBeenCalledTimes(1);
  });

  it('should execute sync with current draft', async () => {
    const mockDraft = {
      draftId: 'draft-sync-1',
      totalAccounts: 4,
      newAccounts: 0,
      updatedAccounts: 4,
      unchangedAccounts: 0,
      changes: [],
    };

    mockSheetsSyncService.createDraft.mockResolvedValue(mockDraft);

    const { result } = renderHook(() => useSheetsSync(mockSheetsSyncService));

    await act(async () => {
      jest.advanceTimersByTime(100);
    });

    mockSheetsSyncService.executeSyncFromDraft.mockResolvedValue({});

    await act(async () => {
      await result.current.onSync();
      jest.advanceTimersByTime(100);
    });

    expect(mockSheetsSyncService.executeSyncFromDraft).toHaveBeenCalledWith('draft-sync-1');
  });

  it('should reload draft after sync', async () => {
    const mockDraft = {
      draftId: 'draft-sync-2',
      totalAccounts: 2,
      newAccounts: 0,
      updatedAccounts: 2,
      unchangedAccounts: 0,
      changes: [],
    };

    mockSheetsSyncService.createDraft.mockResolvedValue(mockDraft);

    const { result } = renderHook(() => useSheetsSync(mockSheetsSyncService));

    await act(async () => {
      jest.advanceTimersByTime(100);
    });

    mockSheetsSyncService.executeSyncFromDraft.mockResolvedValue({});
    mockSheetsSyncService.createDraft.mockClear();

    await act(async () => {
      await result.current.onSync();
      jest.advanceTimersByTime(100);
    });

    expect(mockSheetsSyncService.createDraft).toHaveBeenCalled();
  });

  it('should handle sync error', async () => {
    const mockDraft = {
      draftId: 'draft-error',
      totalAccounts: 1,
      newAccounts: 0,
      updatedAccounts: 1,
      unchangedAccounts: 0,
      changes: [],
    };

    mockSheetsSyncService.createDraft.mockResolvedValue(mockDraft);

    const { result } = renderHook(() => useSheetsSync(mockSheetsSyncService));

    await act(async () => {
      jest.advanceTimersByTime(100);
    });

    mockSheetsSyncService.executeSyncFromDraft.mockRejectedValue(new Error('Sync failed'));

    await act(async () => {
      await result.current.onSync();
      jest.advanceTimersByTime(100);
    });

    expect(result.current.error).toBe('Sync failed');
    expect(result.current.syncing).toBe(false);
  });

  it('should return error when no draft available', async () => {
    mockSheetsSyncService.createDraft.mockRejectedValue(new Error('Load failed'));

    const { result } = renderHook(() => useSheetsSync(mockSheetsSyncService));

    await act(async () => {
      jest.advanceTimersByTime(100);
    });

    await act(async () => {
      await result.current.onSync();
      jest.advanceTimersByTime(100);
    });

    expect(result.current.error).toBe('No draft available to sync');
  });

  it('should clear error on successful refresh', async () => {
    mockSheetsSyncService.createDraft.mockRejectedValueOnce(new Error('First error'));

    const { result } = renderHook(() => useSheetsSync(mockSheetsSyncService));

    await act(async () => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current.error).toBe('First error');

    mockSheetsSyncService.createDraft.mockResolvedValueOnce({
      draftId: 'draft-recovery',
      totalAccounts: 1,
      newAccounts: 0,
      updatedAccounts: 1,
      unchangedAccounts: 0,
      changes: [],
    });

    await act(async () => {
      await result.current.onRefresh();
      jest.advanceTimersByTime(600);
    });

    expect(result.current.error).toBeNull();
  });
});
