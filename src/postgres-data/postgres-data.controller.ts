import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PostgresDataService } from './postgres-data.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('postgres-data')
@UseGuards(AuthGuard)
export class PostgresDataController {
  constructor(private readonly postgresDataService: PostgresDataService) {}

  @Get('/db/selected')
  getDbSelected() {
    return this.postgresDataService.getDbSelected();
  }

  @Get('/db/version')
  async getDbVersion() {
    return this.postgresDataService.getDbVersion();
  }

  @Get('/os/version')
  async getOsVersion() {
    return this.postgresDataService.getOsVersion();
  }

  @Get('/os/ram')
  async getRamSize() {
    return this.postgresDataService.getRamSize();
  }

  @Get('/os/cpu')
  async getCpuSize() {
    return this.postgresDataService.getCpuSize();
  }

  @Get('/os/disk/io_wait')
  async getOsDiskIOWait() {
    return this.postgresDataService.getOsDiskIOWait();
  }

  @Get('/disk/read_percent')
  async getDiskPercentRead() {
    return this.postgresDataService.getDiskPercentRead();
  }

  @Get('/db/total_io')
  async getDBIOInfo() {
    return this.postgresDataService.getDBIOInfo();
  }

  @Get('/db/tables_count')
  async getTablesCount() {
    return this.postgresDataService.getTablesCount();
  }

  @Get('/db/size_all')
  async getDbSizeAll() {
    return this.postgresDataService.getDbSizeAll();
  }

  @Get('/db/top10-tables')
  async getDbTop10Tables() {
    return this.postgresDataService.getDbTop10Tables();
  }

  @Get('/db/dead_tuples_top_50')
  async getDbDeadTuples() {
    return this.postgresDataService.getDbDeadTuples();
  }

  @Get('/db/invalid-indexes')
  async getDbInvalidIndexes() {
    return this.postgresDataService.getDbInvalidIndexes();
  }

  @Get('/db/top-disk-read-queries')
  async getDbTopDiskReadQuery() {
    return this.postgresDataService.getDbTopDiskReadQuery();
  }

  @Get('/db/params')
  async getPostgresParams() {
    return this.postgresDataService.getPostgresParams();
  }

  @Get('/db/active-locks')
  async getActiveLocks() {
    return this.postgresDataService.getActiveLocks();
  }

  @Get('/db/long-running-queries')
  async getLongRunningQueries(@Query('threshold') threshold?: string) {
    const thresholdSeconds = threshold ? parseInt(threshold, 10) : 30;
    return this.postgresDataService.getLongRunningQueries(thresholdSeconds);
  }

  @Get('/db/idle-in-transaction')
  async getIdleInTransaction() {
    return this.postgresDataService.getIdleInTransaction();
  }

  @Get('/db/index-stats')
  async getIndexStats() {
    return this.postgresDataService.getIndexStats();
  }

  @Get('/db/connection-stats')
  async getConnectionStats() {
    return this.postgresDataService.getConnectionStats();
  }

  @Get('/db/qps')
  async getQPS() {
    return this.postgresDataService.getQPS();
  }
}