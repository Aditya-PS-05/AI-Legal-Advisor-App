import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { CanActivate } from '@nestjs/common';
import { auth } from 'express-oauth2-jwt-bearer';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthConfig } from './auth.config';

@Injectable()
export class AuthGuard implements CanActivate {
  private validateAuth0Token: any;

  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    const config = this.configService.get<AuthConfig>('auth');
    this.validateAuth0Token = auth({
      issuerBaseURL: `https://${config.domain}/`,
      audience: config.audience,
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
      // Validate the token
      await new Promise((resolve, reject) => {
        this.validateAuth0Token(request, null, (err: any) => {
          if (err) {
            reject(err);
          }
          resolve(true);
        });
      });

      // Get user info from Auth0 token
      const user = request.auth?.payload;
      if (!user) {
        throw new UnauthorizedException('No user information found');
      }

      // Find or create user in our database
      const dbUser = await this.authService.findOrCreateUser({
        sub: user.sub,
        email: user.email,
        name: user.name,
      });

      // Attach user to request
      request.user = {
        ...dbUser,
        accessToken: request.headers.authorization?.split(' ')[1],
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
} 