import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SetupFormState, SetupFormHandlers } from '@/hooks/useSetupForm';

const FORM_STYLES = {
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
  },
  errorBox: {
    backgroundColor: '#ffe0e0',
    borderColor: '#ff6b6b',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#d63031',
  },
};

interface SetupFormUIProps extends SetupFormState, SetupFormHandlers {
  defaultBaseUrl: string;
}

/**
 * Pure UI component for the setup form.
 * All props are passed from useSetupForm hook - no business logic here.
 * 
 * Single Responsibility: Only renders UI and calls handlers.
 * 
 * @param props - Form state and handlers from useSetupForm
 */
export function SetupFormUI({
  apiKey,
  baseUrl,
  error,
  isLoading,
  defaultBaseUrl,
  handleApiKeyChange,
  handleBaseUrlChange,
  handleSubmit,
}: SetupFormUIProps) {
  const insets = useSafeAreaInsets();
  const isValid = apiKey.trim().length > 0 && baseUrl.trim().length > 0;

  return (
    <ThemedView
      style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: 20,
          justifyContent: 'flex-start',
        }}
      >
        <ThemedText type="title" style={{ marginBottom: 10 }}>
          Setup Smart Pocket
        </ThemedText>
        <ThemedText type="subtitle" style={{ marginBottom: 30 }}>
          Enter your API credentials to get started
        </ThemedText>

        {/* API Key Input */}
        <View style={{ marginBottom: 20 }}>
          <ThemedText style={{ marginBottom: 8, fontWeight: '600' }}>
            API Key
          </ThemedText>
          <TextInput
            style={FORM_STYLES.input}
            placeholder="Enter your API key"
            placeholderTextColor="#999"
            value={apiKey}
            onChangeText={handleApiKeyChange}
            editable={!isLoading}
            secureTextEntry={false}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {apiKey.length > 0 && apiKey.trim().length === 0 && (
            <ThemedText style={{ color: '#ff6b6b', fontSize: 12, marginTop: 4 }}>
              API key cannot be empty
            </ThemedText>
          )}
        </View>

        {/* Server URL Input */}
        <View style={{ marginBottom: 20 }}>
          <ThemedText style={{ marginBottom: 8, fontWeight: '600' }}>
            Server URL
          </ThemedText>
          <TextInput
            style={FORM_STYLES.input}
            placeholder={defaultBaseUrl}
            placeholderTextColor="#999"
            value={baseUrl}
            onChangeText={handleBaseUrlChange}
            editable={!isLoading}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          <ThemedText style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            Default: {defaultBaseUrl}
          </ThemedText>
        </View>

        {/* Error Display */}
        {error && (
          <View style={FORM_STYLES.errorBox}>
            <ThemedText style={FORM_STYLES.errorText}>{error}</ThemedText>
          </View>
        )}

        {/* Setup Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!isValid || isLoading}
          style={{
            backgroundColor:
              isValid && !isLoading ? '#0066cc' : '#ccc',
            paddingVertical: 14,
            borderRadius: 8,
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText
              style={{
                color: '#fff',
                fontSize: 16,
                fontWeight: '600',
              }}
            >
              Continue
            </ThemedText>
          )}
        </TouchableOpacity>

        <ThemedText style={{ fontSize: 12, color: '#666', textAlign: 'center' }}>
          Your credentials are stored securely on this device.
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}
