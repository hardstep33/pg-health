import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostgresDataModule } from './postgres-data/postgres-data.module';
import { ConnectionManagerModule } from './connection-manager/connection-manager.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    ConnectionManagerModule,
    PostgresDataModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}