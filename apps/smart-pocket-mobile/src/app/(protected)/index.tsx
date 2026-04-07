/**
 * Dashboard Screen
 * Main entry point after login
 * Shows available features/services
 */

import { ScrollView, View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useContext } from 'react';
import { AuthContext } from '@/utils/authContext';

interface FeatureAction {
  id: string;
  title: string;
  subtitle: string;
  route: string;
  icon: string;
  enabled: boolean;
}

const FEATURES: FeatureAction[] = [
  {
    id: 'sheets-sync',
    title: 'Google Sheets Sync',
    subtitle: 'Sync Actual Budget accounts to Google Sheets',
    route: '/sync',
    icon: '📊',
    enabled: true,
  },
  {
    id: 'budgets',
    title: 'Budget Management',
    subtitle: 'Coming soon...',
    route: '/budgets',
    icon: '💰',
    enabled: false,
  },
  {
    id: 'reports',
    title: 'Reports & Analytics',
    subtitle: 'Coming soon...',
    route: '/reports',
    icon: '📈',
    enabled: false,
  },
];

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const authContext = useContext(AuthContext);

  const handleLogout = async () => {
    await authContext.logout();
  };

  const navigateToFeature = (route: string, enabled: boolean) => {
    if (!enabled) {
      return; // Don't navigate to disabled features
    }
    router.push(route as any);
  };

  return (
    <ThemedView
      style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: 20,
        }}
      >
        {/* Header */}
        <View style={{ marginBottom: 30 }}>
          <ThemedText type="title" style={{ marginBottom: 8 }}>
            Dashboard
          </ThemedText>
          <ThemedText style={{ opacity: 0.6 }}>
            Welcome back, {authContext.baseUrl ? '👋' : 'User'}
          </ThemedText>
        </View>

        {/* Features Grid */}
        <View style={{ gap: 12, marginBottom: 30 }}>
          {FEATURES.map((feature) => (
            <TouchableOpacity
              key={feature.id}
              disabled={!feature.enabled}
              onPress={() => navigateToFeature(feature.route, feature.enabled)}
              style={[
                styles.featureCard,
                !feature.enabled && styles.featureCardDisabled,
              ]}
            >
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <ThemedText style={{ fontSize: 20, marginRight: 10 }}>
                    {feature.icon}
                  </ThemedText>
                  <ThemedText type="subtitle" style={{ flex: 1 }}>
                    {feature.title}
                  </ThemedText>
                </View>
                <ThemedText
                  style={{
                    fontSize: 13,
                    opacity: 0.6,
                    paddingLeft: 30,
                  }}
                >
                  {feature.subtitle}
                </ThemedText>
              </View>
              {feature.enabled && (
                <ThemedText style={{ fontSize: 16, marginLeft: 10 }}>
                  →
                </ThemedText>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          <ThemedText
            style={{
              color: '#ff6b6b',
              fontWeight: '600',
              textAlign: 'center',
            }}
          >
            Logout
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  featureCard: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featureCardDisabled: {
    opacity: 0.5,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#ff6b6b',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});
