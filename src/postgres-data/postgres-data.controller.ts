import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { PostgresDataService } from './postgres-data.service';

@Controller('postgres-data')
class PostgresDataController {
  constructor(private readonly postgresDataService: PostgresDataService) {}

  /* Формирование заголовка для отображения подключенной базы данных */
  @Get('/db/selected')
  getDbSelected() {
    return this.postgresDataService.getDbSelected();
  }

  /* Получение версии БД */
  @Get('/db/version')
  async getDbVersion() {
    return this.postgresDataService.getDbVersion();
  }

  /* Получение версии ОС */
  @Get('/os/version')
  async getOsVersion() {
    return this.postgresDataService.getOsVersion();
  }

  /* Получение размера RAM */
  @Get('/os/ram')
  async getRamSize() {
    return this.postgresDataService.getRamSize();
  }

  /* Получение размера CPU */
  @Get('/os/cpu')
  async getCpuSize() {
    return this.postgresDataService.getCpuSize();
  }

  /* Активные запросы, ожидающие диск (Текущий момент)
   * Анализ: Если wait_event_type — IO, запрос уперся в скорость диска.
   * */
  @Get('/os/disk/io_wait')
  async getOsDiskIOWait() {
    return this.postgresDataService.getOsDiskIOWait();
  }

  /*2. Степень использования диска таблицами и индексами
   * Запрос показывает количество блоков, прочитанных с диска (а не из кэша) для каждой таблицы.*/
  @Get('/disk/read_percent')
  async getDiskPercentRead() {
    return this.postgresDataService.getDiskPercentRead();
  }

  /*Статистика I/O по базе данных в целом*/
  @Get('/db/total_io')
  async getDBIOInfo() {
    return this.postgresDataService.getDBIOInfo();
  }

  /* Количество  таблиц в разрезе схем*/
  @Get('/db/tables_count')
  async getTablesCount() {
    return this.postgresDataService.getTablesCount();
  }

  /* Общий размер БД */
  @Get('/db/size_all')
  async getDbSizeAll() {
    return this.postgresDataService.getDbSizeAll();
  }

  /* ТОП-10 таблиц по размеру */
  @Get('/db/top10-tables')
  async getDbTop10Tables() {
    return this.postgresDataService.getDbTop10Tables();
  }

  /* таблицы и их состояние по мертвым кортежам, состоянию автовакуума и прочему */
  @Get('/db/dead_tuples_top_50')
  async getDbDeadTuples() {
    return this.postgresDataService.getDbDeadTuples();
  }

  /* Список недействительных индексов и их размер  */
  @Get('/db/invalid-indexes')
  async getDbInvalidIndexes() {
    return this.postgresDataService.getDbInvalidIndexes();
  }

  /* Тяжёлые запросы с чтением с диска   */
  @Get('/db/top-disk-read-queries')
  async getDbTopDiskReadQuery() {
    return this.postgresDataService.getDbTopDiskReadQuery();
  }

  /* Получение текущих параметров PostgreSQL */
  @Get('/db/params')
  async getPostgresParams() {
    return this.postgresDataService.getPostgresParams();
  }

  /* Активные блокировки */
  @Get('/db/active-locks')
  async getActiveLocks() {
    return this.postgresDataService.getActiveLocks();
  }

  /* Запросы, висящие дольше N секунд */
  @Get('/db/long-running-queries')
  async getLongRunningQueries(@Query('threshold') threshold?: string) {
    const thresholdSeconds = threshold ? parseInt(threshold, 10) : 30;
    return this.postgresDataService.getLongRunningQueries(thresholdSeconds);
  }

  /* Транзакции idle in transaction */
  @Get('/db/idle-in-transaction')
  async getIdleInTransaction() {
    return this.postgresDataService.getIdleInTransaction();
  }

  /* Статистика использования индексов */
  @Get('/db/index-stats')
  async getIndexStats() {
    return this.postgresDataService.getIndexStats();
  }

  /* Статистика подключений */
  @Get('/db/connection-stats')
  async getConnectionStats() {
    return this.postgresDataService.getConnectionStats();
  }

  /* Показатель QPS */
  @Get('/db/qps')
  async getQPS() {
    return this.postgresDataService.getQPS();
  }
}

export default PostgresDataController;
