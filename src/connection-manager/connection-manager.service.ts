import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ConnectionManagerService {
  constructor(private dbService: DatabaseService) {}

  getConnectionList() {
    return this.dbService.getConnectionList();
  }

  switchTo(id: string) {
    return this.dbService.switchTo(id);
  }

  getCurrentDataSource() {
    // Совместимость со старым кодом – возвращаем объект с методом query
    return {
      query: (text: string, params?: any[]) => this.dbService.query(text, params),
    };
  }

  getCurrentId() {
    return this.dbService.getCurrentId();
  }
}