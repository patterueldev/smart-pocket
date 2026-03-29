/**
 * Token Repository Interface
 *
 * Abstracts data access for token management.
 * Currently not implemented (MVP uses stateless JWT).
 * Future: Support token revocation and blacklisting.
 *
 * Example implementation (PostgreSQL + Prisma):
 * ```
 * class TokenRepository implements ITokenRepository {
 *   async save(token: RevokedToken): Promise<void> {
 *     await prisma.revokedToken.create({ data: token });
 *   }
 *
 *   async isBlacklisted(tokenId: string): Promise<boolean> {
 *     const revoked = await prisma.revokedToken.findUnique({ where: { id: tokenId } });
 *     return !!revoked;
 *   }
 * }
 * ```
 */
interface ITokenRepository {
  /**
   * Save a revoked token
   * @param tokenId The JWT jti (if present) or token hash
   * @param expiresAt When the token expires
   */
  save(tokenId: string, expiresAt: Date): Promise<void>;

  /**
   * Check if a token is blacklisted
   * @param tokenId The JWT jti or token hash
   * @returns True if blacklisted, false otherwise
   */
  isBlacklisted(tokenId: string): Promise<boolean>;

  /**
   * Revoke a token
   * @param tokenId The JWT jti or token hash
   */
  revoke(tokenId: string): Promise<void>;

  /**
   * Clean up expired tokens
   */
  cleanupExpired(): Promise<void>;
}

export default ITokenRepository;
export { ITokenRepository };
