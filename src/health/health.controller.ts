import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Controller('health')
export class HealthController {
  constructor(private dbService: DatabaseService) {}

  @Get()
  async check() {
    try {
      await this.dbService.query('SELECT 1');
      return { status: 'ok', timestamp: new Date().toISOString() };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}