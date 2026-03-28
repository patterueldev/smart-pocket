# Smart Pocket Mobile - Environment Configuration Guide

## Overview

The mobile app uses `app.config.js` to dynamically generate environment-specific configurations (bundle IDs, app names, API endpoints) based on the `APP_ENV` environment variable.

## Architecture

### Single Configuration File

```
app.config.js  ← Reads APP_ENV and generates config dynamically
  └─ APP_ENV=dev  → dev.patteruel.smartpocket.dev + dev API
  └─ APP_ENV=qa   → dev.patteruel.smartpocket.qa + qa API
  └─ APP_ENV=prod → dev.patteruel.smartpocket + prod API (default)
```

### Why app.config.js?

✅ Single source of truth - one file for all environments  
✅ Dynamic configuration - uses environment variables  
✅ Official Expo pattern - recommended best practice  
✅ CI/CD friendly - easy to pass env vars at build time  
✅ No file duplication - no multiple app.json files  

## Environment Configuration

### Bundle IDs & Packages

| Environment | iOS Bundle ID | Android Package | App Name | API Endpoint |
|---|---|---|---|---|
| **Development** | `dev.patteruel.smartpocket.dev` | `dev.patteruel.smartpocket.dev` | Smart Pocket Dev | https://smartpocket-dev.nicenature.space |
| **QA/Staging** | `dev.patteruel.smartpocket.qa` | `dev.patteruel.smartpocket.qa` | Smart Pocket QA | https://smartpocket-qa.nicenature.space |
| **Production** | `dev.patteruel.smartpocket` | `dev.patteruel.smartpocket` | Smart Pocket | https://smartpocket.patteruel.dev |

## Local Development

### Development (Default)

```bash
# Set APP_ENV to dev
APP_ENV=dev npm start
```

This will:
- Use bundle ID: `dev.patteruel.smartpocket.dev`
- Connect to: `https://smartpocket-dev.nicenature.space`
- Show app name: "Smart Pocket Dev"

### QA/Staging

```bash
# Set APP_ENV to qa
APP_ENV=qa npm start
```

This will:
- Use bundle ID: `dev.patteruel.smartpocket.qa`
- Connect to: `https://smartpocket-qa.nicenature.space`
- Show app name: "Smart Pocket QA"

### Production

```bash
# Default (no APP_ENV or APP_ENV=prod)
npm start
# or
APP_ENV=prod npm start
```

This will:
- Use bundle ID: `dev.patteruel.smartpocket`
- Connect to: `https://smartpocket.patteruel.dev`
- Show app name: "Smart Pocket"

## Multiple Versions on Same Device

Since each environment has a unique bundle ID, all three versions can be installed simultaneously:

```
Device
├── Smart Pocket Dev (dev.patteruel.smartpocket.dev)
├── Smart Pocket QA (dev.patteruel.smartpocket.qa)
└── Smart Pocket (dev.patteruel.smartpocket)
```

Perfect for testing across environments on a single device.

## GitHub Actions / CI/CD Setup

### Example: GitHub Actions Workflow

```yaml
name: Build Mobile App

on:
  push:
    branches:
      - develop    # Build dev
      - staging    # Build QA
      - main       # Build production

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          cd apps/smart-pocket-mobile
          npm ci

      # Development build
      - name: Build for Development
        if: github.ref == 'refs/heads/develop'
        run: |
          cd apps/smart-pocket-mobile
          APP_ENV=dev eas build --platform ios --token ${{ secrets.EAS_TOKEN }}
          APP_ENV=dev eas build --platform android --token ${{ secrets.EAS_TOKEN }}

      # QA build
      - name: Build for QA
        if: github.ref == 'refs/heads/staging'
        run: |
          cd apps/smart-pocket-mobile
          APP_ENV=qa eas build --platform ios --token ${{ secrets.EAS_TOKEN }}
          APP_ENV=qa eas build --platform android --token ${{ secrets.EAS_TOKEN }}

      # Production build
      - name: Build for Production
        if: github.ref == 'refs/heads/main'
        run: |
          cd apps/smart-pocket-mobile
          APP_ENV=prod eas build --platform ios --token ${{ secrets.EAS_TOKEN }}
          APP_ENV=prod eas build --platform android --token ${{ secrets.EAS_TOKEN }}
```

### Example: eas.json Configuration

```json
{
  "build": {
    "dev": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "buildType": "simulator"
      },
      "env": {
        "APP_ENV": "dev"
      }
    },
    "qa": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "buildType": "simulator"
      },
      "env": {
        "APP_ENV": "qa"
      }
    },
    "prod": {
      "android": {
        "buildType": "aab"
      },
      "ios": {
        "buildType": "archive"
      },
      "env": {
        "APP_ENV": "prod"
      }
    }
  }
}
```

### Building with EAS

```bash
# Development
eas build --platform ios --profile dev

# QA
eas build --platform android --profile qa

# Production
eas build --platform ios --profile prod
```

## How Configuration Works

### At Build Time

1. **app.config.js** reads the `APP_ENV` environment variable
2. Based on `APP_ENV`, it selects the appropriate configuration
3. Expo uses that configuration to build the app
4. Different bundle IDs = different apps that can coexist

### At Runtime

1. **Constants.expoConfig** provides access to the selected configuration
2. **src/constants/config.ts** reads the API base URL from Constants
3. **Setup screen** uses the default base URL from the config
4. Users can still override the URL if needed

### No Defaults

- Configuration is **required** - missing values throw errors
- All values must be defined in **app.config.js**
- Fail-safe: can't accidentally use missing configuration

## Files

- **app.config.js** - Dynamic configuration (the only config file needed)
- **app.json.example** - Reference/fallback (for documentation)
- **src/constants/config.ts** - Reads config from app.config.js
- **src/app/setup.tsx** - Uses getDefaultBaseUrl() from config

## Environment Variable Summary

```bash
# Development
APP_ENV=dev npm start

# QA
APP_ENV=qa npm start

# Production (default)
npm start
# or
APP_ENV=prod npm start
```

## Troubleshooting

### "Missing API configuration in app.config.js"

This means app.config.js is missing or `APP_ENV` is not being set correctly.

**Solution**: Make sure you:
1. Set `APP_ENV` before running: `APP_ENV=dev npm start`
2. Or remove it to use default (production): `npm start`

### App is using wrong bundle ID

Make sure `APP_ENV` is set correctly before building:

```bash
# Check current APP_ENV
echo $APP_ENV

# Set it before building
APP_ENV=dev eas build --platform ios
```

### Different app name than expected

The app name comes from app.config.js based on `APP_ENV`:
- `APP_ENV=dev` → "Smart Pocket Dev"
- `APP_ENV=qa` → "Smart Pocket QA"
- `APP_ENV=prod` → "Smart Pocket"

Verify your `APP_ENV` is correct.

## Next Steps

1. **Verify locally**:
   ```bash
   APP_ENV=dev npm start
   APP_ENV=qa npm start
   npm start
   ```

2. **Set up GitHub Actions** using the workflow above

3. **Configure eas.json** with build profiles if using EAS

4. **Set up secrets** in GitHub (EAS_TOKEN if using EAS builds)

## Key Benefits

✅ Single configuration file  
✅ Environment variables for CI/CD  
✅ Different bundle IDs prevent conflicts  
✅ Multiple versions on same device  
✅ Type-safe configuration  
✅ Official Expo pattern  
✅ Easy to maintain and extend  

