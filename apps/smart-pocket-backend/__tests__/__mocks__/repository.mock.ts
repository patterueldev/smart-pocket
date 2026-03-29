import { IApiKeyRepository } from '../../src/interfaces';

export const mockApiKeyRepository: jest.Mocked<IApiKeyRepository> = {
  isValidApiKey: jest.fn(),
};
