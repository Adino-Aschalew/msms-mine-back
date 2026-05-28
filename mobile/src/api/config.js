import { Platform } from 'react-native';
import Constants from 'expo-constants';

const API_PORT = process.env.EXPO_PUBLIC_API_PORT || '9999';

function getDebuggerHost() {
  const expoGo = Constants.expoGoConfig?.debuggerHost;
  if (expoGo) return expoGo.split(':')[0];

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) return hostUri.split(':')[0];

  return null;
}

export function getApiBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  }

  const host = getDebuggerHost();
  if (host) {
    return `http://${host}:${API_PORT}/api`;
  }

  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${API_PORT}/api`;
  }

  return `http://localhost:${API_PORT}/api`;
}

export const API_BASE_URL = getApiBaseUrl();
