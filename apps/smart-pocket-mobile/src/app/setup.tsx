import React, { useContext, useState } from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { AuthContext } from '@/utils/authContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getDefaultBaseUrl } from '@/constants/config';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DEFAULT_BASE_URL = getDefaultBaseUrl();

export default function SetupScreen() {
  const authContext = useContext(AuthContext);
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL);
  const [localError, setLocalError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const handleSetup = async () => {
    setLocalError(null);

    // Validation
    if (!apiKey.trim()) {
      setLocalError('Please enter an API key');
      return;
    }



    if (!baseUrl.trim()) {
      setLocalError('Please enter a server URL');
      return;
    }

    // Ensure URL starts with http:// or https://
    const urlToUse = baseUrl.trim().startsWith('http')
      ? baseUrl.trim()
      : `http://${baseUrl.trim()}`;

    try {
      await authContext.setup({
        apiKey: apiKey.trim(),
        baseUrl: urlToUse,
      });
    } catch {
      // Error is already set in context, we can display it
      setLocalError(authContext.error || 'Setup failed. Please try again.');
    }
  };

  const isValid = apiKey.trim().length > 0 && baseUrl.trim().length > 0;

  return (
    <ThemedView style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}>
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
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
              color: '#000',
              backgroundColor: '#fff',
            }}
            placeholder="Enter your API key"
            placeholderTextColor="#999"
            value={apiKey}
            onChangeText={setApiKey}
            editable={!authContext.isLoading}
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
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
              color: '#000',
              backgroundColor: '#fff',
            }}
            placeholder={DEFAULT_BASE_URL}
            placeholderTextColor="#999"
            value={baseUrl}
            onChangeText={setBaseUrl}
            editable={!authContext.isLoading}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          <ThemedText style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            Default: {DEFAULT_BASE_URL}
          </ThemedText>
        </View>

        {/* Error Display */}
        {(localError || authContext.error) && (
          <View
            style={{
              backgroundColor: '#ffe0e0',
              borderColor: '#ff6b6b',
              borderWidth: 1,
              borderRadius: 8,
              padding: 12,
              marginBottom: 20,
            }}
          >
            <ThemedText style={{ color: '#d63031' }}>
              {localError || authContext.error}
            </ThemedText>
          </View>
        )}

        {/* Setup Button */}
        <TouchableOpacity
          onPress={handleSetup}
          disabled={!isValid || authContext.isLoading}
          style={{
            backgroundColor: isValid && !authContext.isLoading ? '#0066cc' : '#ccc',
            paddingVertical: 14,
            borderRadius: 8,
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          {authContext.isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
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
