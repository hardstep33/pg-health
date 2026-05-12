import { Module, Global } from '@nestjs/common';
import { ConnectionManagerService } from './connection-manager.service';
import { ConnectionManagerController } from './connection-manager.controller';
import { AppConfigModule } from '../app-config.module';

@Global()
@Module({
  imports: [AppConfigModule], // ← добавляем
  controllers: [ConnectionManagerController],
  providers: [ConnectionManagerService],
  exports: [ConnectionManagerService],
})
export class ConnectionManagerModule {}