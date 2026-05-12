import { Module } from '@nestjs/common';
import PostgresDataController from './postgres-data.controller';
import { PostgresDataService } from './postgres-data.service';

@Module({

  controllers: [PostgresDataController],
  providers: [PostgresDataService],
})
export class PostgresDataModule {}
