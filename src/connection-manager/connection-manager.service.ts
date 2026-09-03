import { Injectable } from '@nestjs/common';
import { DatabaseService, CreateConnectionDto } from '../database/database.service';

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

  addConnection(dto: CreateConnectionDto) {
    return this.dbService.addConnection(dto);
  }

  updateConnection(id: string, dto: Partial<CreateConnectionDto>) {
    return this.dbService.updateConnection(id, dto);
  }

  testConnection(dto: CreateConnectionDto) {
    return this.dbService.testConnection(dto.host, dto.port, dto.database, dto.user, dto.password);
  }
}