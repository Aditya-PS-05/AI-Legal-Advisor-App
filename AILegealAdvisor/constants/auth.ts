import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export const AUTH_CONFIG = {
  domain: 'dev-d52f8u7cuxe2rwfh.us.auth0.com',
  clientId: 'nV7SUdz74YLDrbZyG120aqNG5Vd9yYao',
  audience: 'https://dev-d52f8u7cuxe2rwfh.us.auth0.com/api/v2/',
  redirectUri: AuthSession.makeRedirectUri({
    scheme: 'ailegaladvisor',
    path: 'auth/callback'
  }),
  scope: 'openid profile email',
};