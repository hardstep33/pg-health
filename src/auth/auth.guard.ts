import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const apiKey = this.configService.get<string>('API_KEY');
    // Если API_KEY не задан в .env, аутентификация отключена
    if (!apiKey) return true;

    const request = context.switchToHttp().getRequest();
    const providedKey = request.headers['x-api-key'];
    if (providedKey && providedKey === apiKey) {
      return true;
    }
    throw new UnauthorizedException('Invalid or missing API key');
  }
}