/**
 * API Key Repository Interface
 *
 * Abstracts data access for API keys.
 * Currently not implemented (MVP uses env-based API keys).
 * Future: Connect to database for dynamic API key management.
 *
 * Example implementation (PostgreSQL + Prisma):
 * ```
 * class ApiKeyRepository implements IApiKeyRepository {
 *   async validate(apiKey: string): Promise<boolean> {
 *     const key = await prisma.apiKey.findUnique({ where: { key: apiKey } });
 *     return key?.isActive ?? false;
 *   }
 * }
 * ```
 */
interface IApiKeyRepository {
  /**
   * Validate an API key
   * @param apiKey The API key to validate
   * @returns True if valid and active, false otherwise
   */
  validate(apiKey: string): Promise<boolean>;

  /**
   * Get API key metadata (optional)
   * @param apiKey The API key
   * @returns Key metadata or null if not found
   */
  getMetadata(apiKey: string): Promise<{ id: string; createdAt: Date; isActive: boolean } | null>;

  /**
   * Revoke an API key
   * @param apiKey The API key to revoke
   */
  revoke(apiKey: string): Promise<void>;
}

export default IApiKeyRepository;
export { IApiKeyRepository };
