import { Controller, Get, Put, Body, UseGuards, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from './user.decorator';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  async getProfile(@User() user: { sub: string }) {
    return this.authService.getUser(user.sub);
  }

  @Put('me')
  @UseGuards(AuthGuard)
  async updateProfile(
    @User() user: { sub: string },
    @Body() data: { name?: string },
  ) {
    return this.authService.updateUser(user.sub, data);
  }

  @Get('userinfo')
  @UseGuards(AuthGuard)
  async getUserInfo(@Headers('authorization') auth: string) {
    const token = auth?.split(' ')[1];
    return this.authService.getUserInfo(token);
  }
} 