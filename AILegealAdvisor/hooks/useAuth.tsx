import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AUTH_CONFIG } from '../constants/auth';

WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userStr = await AsyncStorage.getItem('auth_user');
      if (token && userStr) {
        setIsAuthenticated(true);
        setUser(JSON.parse(userStr));
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    }
  };

  const login = async () => {
    try {
      const config: AuthSession.AuthRequestConfig = {
        clientId: AUTH_CONFIG.clientId,
        scopes: AUTH_CONFIG.scope.split(' '),
        redirectUri: AUTH_CONFIG.redirectUri,
        responseType: AuthSession.ResponseType.Token,
        extraParams: {
          audience: AUTH_CONFIG.audience
        }
      };

      const authRequest = new AuthSession.AuthRequest(config);
      const result = await authRequest.promptAsync({
        authorizationEndpoint: `https://${AUTH_CONFIG.domain}/authorize`
      });

      if (result.type === 'success' && result.authentication) {
        const { accessToken } = result.authentication;
        
        const userInfoResponse = await fetch(`https://${AUTH_CONFIG.domain}/userinfo`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        
        const userInfo = await userInfoResponse.json();
        await AsyncStorage.setItem('auth_token', accessToken);
        await AsyncStorage.setItem('auth_user', JSON.stringify(userInfo));

        setIsAuthenticated(true);
        setUser(userInfo);
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('auth_user');
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
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