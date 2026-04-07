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
  actualBudgetServerUrl: string | undefined;
  actualBudgetPassword: string | undefined;
  actualBudgetId: string | undefined;
  googleCredentialsPath: string | undefined;
  googleSheetId: string | undefined;
  googleSheetName: string;
  defaultCurrency: string;
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
  actualBudgetServerUrl: process.env.ACTUAL_BUDGET_SERVER_URL,
  actualBudgetPassword: process.env.ACTUAL_BUDGET_PASSWORD,
  actualBudgetId: process.env.ACTUAL_BUDGET_ID,
  googleCredentialsPath:
    process.env.GOOGLE_CREDENTIALS_JSON_PATH || '/data/keys/sheets-credential.json',
  googleSheetId: process.env.GOOGLE_SHEET_ID || '',
  googleSheetName: process.env.GOOGLE_SHEET_NAME || '',
  defaultCurrency: process.env.DEFAULT_CURRENCY || 'PHP',
};

export default config;
