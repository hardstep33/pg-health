import { Injectable } from '@nestjs/common';
import { ConnectionManagerService } from '../connection-manager/connection-manager.service';
import { SqlQuery } from './queries'

@Injectable()
export class PostgresDataService {
  constructor(private connectionManager: ConnectionManagerService) {}

  /* Обертка для парсинга запроса и вывода результатов */
  private async tryParse(query: string, params?: any[]) {
    try {
      return await this.pgClient.query(query, params );
    } catch (error) {
      return {
        data: '',
        exception: error.message,
        query: query
      };
    }
  }

  private get pgClient() {
    return this.connectionManager.getCurrentDataSource();
  }

  /* Получение строки подключенного сервера */
  public getDbSelected() {
    const list = this.connectionManager.getConnectionList();
    const currentId = this.connectionManager.getCurrentId();
    const current = list.find((c) => c.id === currentId);
    if (current) {
      return { selected: `${current.host}:${current.port}` };
    }
    return { selected: 'не выбрано' };
  }

  /* Получение версии БД */
  public async getDbVersion() {
    return this.tryParse(SqlQuery.getVersion());
  }

  /* Получение версии ОС */
  public async getOsVersion() {
    return this.tryParse(SqlQuery.getOsVersion());
  }

  /* Получение размера RAM */
  public async getRamSize() {
    return this.tryParse(SqlQuery.getRamSize());
  }

  /* Получение размера CPU */
  public async getCpuSize() {
    return this.tryParse(SqlQuery.getCpuSize());
  }

  /* Активные запросы, ожидающие диск (Текущий момент)
   * Анализ: Если wait_event_type — IO, запрос уперся в скорость диска.
   * */
  public async getOsDiskIOWait() {
    return this.tryParse(SqlQuery.getOsDiskIOWait());
  }

  /*Степень использования диска таблицами и индексами
   * Запрос показывает количество блоков, прочитанных с диска (а не из кэша) для каждой таблицы.*/
  public async getDiskPercentRead() {
    return this.tryParse(SqlQuery.getDiskPercentRead());
  }

  /*Статистика I/O по базе данных в целом*/
  public async getDBIOInfo() {
    return this.tryParse(SqlQuery.getDBIOInfo());
  }

  /* Список схем и количества таблиц */
  public async getTablesCount() {
    return this.tryParse(SqlQuery.getTablesCount());
  }

  /* Размер всей БД */
  public async getDbSizeAll() {
    return this.tryParse(SqlQuery.getDbSizeAll());
  }

  /* ТОП-10 таблиц по размеру */
  public async getDbTop10Tables() {
    return this.tryParse(SqlQuery.getDbTop10Tables());
  }

  /* таблицы и их состояние по мертвым кортежам, состоянию автовакуума и прочему */
  public async getDbDeadTuples() {
    return this.tryParse(SqlQuery.getDbDeadTuples());
  }

  /* Список недействительных индексов и их размер  */
  public async getDbInvalidIndexes() {
    return this.tryParse(SqlQuery.getDbInvalidIndexes());
  }

  /* Тяжёлые запросы с чтением с диска   */
  public async getDbTopDiskReadQuery() {
    return this.tryParse(SqlQuery.getDbTopDiskReadQuery());
  }

  /* Получение текущих параметров PostgreSQL */
  public async getPostgresParams() {
    return this.tryParse(SqlQuery.getPostgresParams());
  }

  /* Активные блокировки */
  public async getActiveLocks() {
    return this.tryParse(SqlQuery.getActiveLocks());
  }

  /* Запросы, висящие дольше N секунд */
  public async getLongRunningQueries(thresholdSeconds: number = 30) {
    return this.tryParse(SqlQuery.getLongRunningQueries(),[thresholdSeconds]);
  }

  /* Транзакции в состоянии idle in transaction */
  public async getIdleInTransaction() {
    return this.tryParse(SqlQuery.getIdleInTransaction());
  }

  /* Статистика использования индексов */
  public async getIndexStats() {
    return this.tryParse(SqlQuery.getIndexStats());
  }

  /* Статистика подключений */
  public async getConnectionStats() {
    return this.tryParse(SqlQuery.getConnectionStats());
  }

  /* Показатель QPS (среднее количество запросов в секунду) */
  public async getQPS() {
    return this.tryParse(SqlQuery.getQPS());
  }
}
