import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostgresDataModule } from './postgres-data/postgres-data.module';
import { AppConfigModule } from './app-config.module';
import { AppConfigService } from './app.config.service';
import { ConnectionManagerModule } from './connection-manager/connection-manager.module';

@Module({
  imports: [
    // Глобальная загрузка .env (чтобы ConfigService работал везде)
    ConfigModule.forRoot({ isGlobal: true }),

    // Модуль, предоставляющий AppConfigService
    AppConfigModule,
    ConnectionManagerModule,
    // Асинхронная конфигурация TypeORM
    TypeOrmModule.forRootAsync({
      imports: [AppConfigModule], // <- теперь AppConfigService доступен для фабрики
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        type: 'postgres',
        host: config.postgresConfig.host,
        port: Number(config.postgresConfig.port),
        username: config.postgresConfig.username,
        password: config.postgresConfig.password,
        database: config.postgresConfig.database,
        entities: config.postgresConfig.entities || [],
        synchronize: config.postgresConfig.synchronize || false,
        extra: config.postgresConfig.extra,
      }),
    }),

    PostgresDataModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
