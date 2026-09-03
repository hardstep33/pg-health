import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ConnectionManagerService } from './connection-manager.service';

export interface CreateConnectionDto {
  description: string;
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

@Controller('api/connections')
export class ConnectionManagerController {
  constructor(private connectionManager: ConnectionManagerService) {}

  @Get()
  list() {
    return this.connectionManager.getConnectionList();
  }

  @Post('switch')
  switch(@Body('id') id: string) {
    return this.connectionManager.switchTo(id);
  }

  @Post('add')
  async add(@Body() dto: CreateConnectionDto) {
    return this.connectionManager.addConnection(dto);
  }

  @Post('update/:id')
  async update(@Param('id') id: string, @Body() dto: Partial<CreateConnectionDto>) {
    return this.connectionManager.updateConnection(id, dto);
  }

  @Post('test')
  async test(@Body() dto: CreateConnectionDto) {
    return this.connectionManager.testConnection(dto);
  }
}
