import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_CONFIG } from '../constants/auth';

WebBrowser.maybeCompleteAuthSession();

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: any | null;
  error: Error | null;
}

interface AuthContextType extends AuthState {
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    accessToken: null,
    user: null,
    error: null,
  });

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userStr = await AsyncStorage.getItem('auth_user');
      if (token && userStr) {
        setState({
          isAuthenticated: true,
          accessToken: token,
          user: JSON.parse(userStr),
          error: null,
        });
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    }
  };

  const login = async () => {
    try {
      const redirectUri = makeRedirectUri({
        scheme: 'ailegaladvisor',
        path: 'auth/callback',
      });

      const authUrl = `https://${AUTH_CONFIG.domain}` +
        `client_id=${AUTH_CONFIG.clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(AUTH_CONFIG.scope)}&` +
        `audience=${encodeURIComponent(AUTH_CONFIG.audience)}&` +
        'response_type=token';

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === 'success' && result.url) {
        const params = new URLSearchParams(result.url.split('#')[1]);
        const accessToken = params.get('access_token');
        
        if (accessToken) {
          const userInfo = await fetchUserInfo(accessToken);
          await AsyncStorage.setItem('auth_token', accessToken);
          await AsyncStorage.setItem('auth_user', JSON.stringify(userInfo));
          
          setState({
            isAuthenticated: true,
            accessToken,
            user: userInfo,
            error: null,
          });
        }
      }
    } catch (error) {
      setState(prev => ({ ...prev, error: error as Error }));
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('auth_user');
      
      const logoutUrl = `https://${AUTH_CONFIG.domain}/v2/logout?` +
        `client_id=${AUTH_CONFIG.clientId}&` +
        `returnTo=${encodeURIComponent(AUTH_CONFIG.logoutUri)}`;
      
      await WebBrowser.openBrowserAsync(logoutUrl);
      
      setState({
        isAuthenticated: false,
        accessToken: null,
        user: null,
        error: null,
      });
    } catch (error) {
      setState(prev => ({ ...prev, error: error as Error }));
    }
  };

  const fetchUserInfo = async (token: string) => {
    const response = await fetch(`https://${AUTH_CONFIG.domain}/userinfo`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 