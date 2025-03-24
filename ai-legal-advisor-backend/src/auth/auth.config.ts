import { registerAs } from '@nestjs/config';

export interface AuthConfig {
  domain: string;
  audience: string;
  clientId: string;
}

export default registerAs('auth', () => ({
  domain: process.env.AUTH0_DOMAIN,
  audience: process.env.AUTH0_AUDIENCE,
  clientId: process.env.AUTH0_CLIENT_ID,
})); 