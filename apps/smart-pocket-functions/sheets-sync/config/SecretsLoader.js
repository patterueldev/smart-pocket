const fs = require('fs');

/**
 * SecretsLoader
 * 
 * Responsible for loading secrets from OpenFaaS secrets directory.
 * Handles both file-based secrets (production) and environment variables (dev).
 * 
 * SOLID principles:
 * - Single Responsibility: Only loads secrets from files/env
 * - Dependency Inversion: Abstracts the source of secrets
 */
class SecretsLoader {
  constructor(secretsDir = '/var/openfaas/secrets') {
    this.secretsDir = secretsDir;
  }

  /**
   * Load a secret from file or environment variable
   * 
   * @param {string} key - Secret key name
   * @param {string} envVarName - Optional environment variable name (defaults to ACTUAL_BUDGET_{KEY})
   * @returns {string} - Secret value
   * @throws {Error} - If secret not found in either source
   */
  getSecret(key, envVarName = null) {
    // Try file-based secret first (production)
    const secretValue = this.getSecretFromFile(key);
    if (secretValue) {
      return secretValue;
    }

    // Fall back to environment variable (development)
    const envKey = envVarName || this.keyToEnvVar(key);
    const envValue = process.env[envKey];
    if (envValue) {
      return envValue;
    }

    // Neither source has the secret
    throw new Error(
      `Secret '${key}' not found in ${this.secretsDir}/${key} or ${envKey} environment variable`
    );
  }

  /**
   * Load a secret from file, return null if not found
   * 
   * @param {string} key - Secret key name
   * @returns {string|null} - Secret value or null
   */
  getSecretFromFile(key) {
    const path = `${this.secretsDir}/${key}`;
    try {
      return fs.readFileSync(path, 'utf8').trim();
    } catch (err) {
      // File doesn't exist or can't be read - this is expected in dev
      return null;
    }
  }

  /**
   * Convert secret key to environment variable name
   * 
   * @param {string} key - Secret key (e.g., 'actual-budget-password')
   * @returns {string} - Environment variable name (e.g., 'ACTUAL_BUDGET_PASSWORD')
   */
  keyToEnvVar(key) {
    return 'ACTUAL_BUDGET_' + key
      .split('-')
      .map(part => part.toUpperCase())
      .join('_');
  }
}

module.exports = SecretsLoader;
