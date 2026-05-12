import { Controller, Get, Post, Body } from '@nestjs/common';
import { ConnectionManagerService } from './connection-manager.service';

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
}
