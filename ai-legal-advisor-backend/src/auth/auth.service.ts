import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { AuthConfig } from './auth.config';

@Injectable()
export class AuthService {
  private domain: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const config = this.configService.get<AuthConfig>('auth');
    this.domain = config.domain;
  }

  async findOrCreateUser(auth0User: { sub: string; email: string; name?: string }) {
    const existingUser = await this.prisma.user.findUnique({
      where: { auth0Id: auth0User.sub },
    });

    if (existingUser) {
      return existingUser;
    }

    return this.prisma.user.create({
      data: {
        auth0Id: auth0User.sub,
        email: auth0User.email,
        name: auth0User.name,
      },
    });
  }

  async getUser(auth0Id: string) {
    return this.prisma.user.findUnique({
      where: { auth0Id },
      include: {
        collections: true,
        queries: true,
      },
    });
  }

  async updateUser(auth0Id: string, data: { name?: string }) {
    return this.prisma.user.update({
      where: { auth0Id },
      data,
    });
  }

  getUserInfo(accessToken: string) {
    return fetch(`https://${this.domain}/userinfo`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }).then(res => res.json());
  }
}