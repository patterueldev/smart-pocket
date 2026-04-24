/**
 * Expo App Configuration
 * 
 * Dynamic configuration based on environment.
 * 
 * Usage:
 *   APP_ENV=dev npm start        # Development
 *   APP_ENV=qa npm start         # QA/Staging
 *   APP_ENV=prod npm start       # Production (default)
 *   
 * For EAS builds:
 *   eas build --platform ios --env APP_ENV=dev
 *   eas build --platform android --env APP_ENV=qa
 */

const getConfig = () => {
  // Determine environment: default to 'dev'
  const env = (process.env.APP_ENV || 'dev').toLowerCase();

  // Environment-specific configuration
  const configs = {
    dev: {
      name: 'Smart Pocket Dev',
      scheme: 'smartpocketmobiledev',
      ios: {
        bundleIdentifier: 'dev.patteruel.smartpocket.dev',
      },
      android: {
        package: 'dev.patteruel.smartpocket.dev',
      },
      apiBaseUrl: 'https://smartpocketapi-dev.nicenature.space',
    },
    qa: {
      name: 'Smart Pocket QA',
      scheme: 'smartpocketmobileqa',
      ios: {
        bundleIdentifier: 'dev.patteruel.smartpocket.qa',
      },
      android: {
        package: 'dev.patteruel.smartpocket.qa',
      },
      apiBaseUrl: 'https://smartpocket-qa.nicenature.space',
    },
    prod: {
      name: 'Smart Pocket',
      scheme: 'smartpocketmobile',
      ios: {
        bundleIdentifier: 'dev.patteruel.smartpocket',
      },
      android: {
        package: 'dev.patteruel.smartpocket',
      },
      apiBaseUrl: 'https://smartpocket.patteruel.dev',
    },
  };

  const selectedConfig = configs[env];

  if (!selectedConfig) {
    throw new Error(
      `Unknown environment: ${env}\n` +
      `Valid environments: ${Object.keys(configs).join(', ')}`
    );
  }

  return selectedConfig;
};

const envConfig = getConfig();

module.exports = {
  expo: {
    name: envConfig.name,
    slug: 'smart-pocket',
    version: '1.1.2',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: envConfig.scheme,
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    ios: {
      bundleIdentifier: envConfig.ios.bundleIdentifier,
      buildNumber: '1',
      supportsTablet: false,
    },
    android: {
      package: envConfig.android.package,
      versionCode: 1,
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: 'a1e89f9a-d846-4bf1-a569-2d01ccae3f61',
      },
      api: {
        baseUrl: envConfig.apiBaseUrl,
      },
    },
    owner: 'jpteruel95',
  },
};
