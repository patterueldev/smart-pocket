import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  nodeEnv: string;
  port: number;
  isDevelopment: boolean;
  isProduction: boolean;
  apiKeys: string[];
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
  jwtAccessExpiry: string;
  jwtRefreshExpiry: string;
}

function parseApiKeys(apiKeysEnv: string | undefined): string[] {
  if (!apiKeysEnv) {
    return [];
  }

  // Try to parse as JSON array first
  if (apiKeysEnv.startsWith('[')) {
    try {
      const parsed = JSON.parse(apiKeysEnv);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // Fall through to CSV parsing
    }
  }

  // Parse as comma-separated values
  return apiKeysEnv
    .split(',')
    .map((key) => key.trim())
    .filter((key) => key.length > 0);
}

const config: EnvConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  apiKeys: parseApiKeys(process.env.API_KEYS),
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-in-production',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production',
  jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRY || '1h',
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
};

export default config;
