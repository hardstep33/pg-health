import { Injectable } from '@nestjs/common';
import { ConnectionManagerService } from '../connection-manager/connection-manager.service';

@Injectable()
export class PostgresDataService {
  constructor(private connectionManager: ConnectionManagerService) {}

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
    return await this.pgClient.query(`select version()`);
  }

  /* Получение версии ОС */
  public async getOsVersion() {
    return await this.pgClient.query(
      `SELECT substring(version() FROM '\\(([^)]+)\\)[^)]*$') AS os_version`,
    );
  }

  /* Получение размера RAM */
  public async getRamSize() {
    try {
      return await this.pgClient.query(
        `SELECT round(split_part(split_part(meminfo, ':', 2), 'k', 1)::numeric / 1024 / 1024, 0) as total_ram_gb
           FROM unnest(string_to_array(pg_read_file('/proc/meminfo', 0, 10000), chr(10))) meminfo
           WHERE meminfo LIKE 'MemTotal%';`,
      );
    } catch (error) {
      return {
        data: '',
        exception: error.message,
      };
    }
  }

  /* Получение размера CPU */
  public async getCpuSize() {
    try {
      return await this.pgClient.query(
        `SELECT
             count(*) as cpu_cores
           FROM
             unnest(string_to_array(pg_read_file('/proc/cpuinfo', 0, 100000), chr(10))) x
           WHERE
             x LIKE 'processor%'`,
      );
    } catch (error) {
      return {
        data: '',
        exception: error.message,
      };
    }
  }

  /* Активные запросы, ожидающие диск (Текущий момент)
   * Анализ: Если wait_event_type — IO, запрос уперся в скорость диска.
   * */
  public async getOsDiskIOWait() {
    try {
      return await this.pgClient.query(
        `SELECT
             pid,
             state,
             wait_event_type,
             wait_event,
             query,
             backend_start
           FROM pg_stat_activity
           WHERE wait_event_type = 'IO'`,
      );
    } catch (error) {
      return {
        data: '',
        exception: error.message,
      };
    }
  }

  /*2. Степень использования диска таблицами и индексами
   * Запрос показывает количество блоков, прочитанных с диска (а не из кэша) для каждой таблицы.*/
  public async getDiskPercentRead() {
    try {
      return await this.pgClient.query(
        `SELECT
             relname AS table_name,
             heap_blks_read,  -- Чтение с диска (медленно)
             heap_blks_hit,   -- Чтение из кэша (быстро)
             -- Процент чтения с диска:
             round(100.0 * heap_blks_read / nullif(heap_blks_read + heap_blks_hit, 0), 2) AS read_percent
           FROM pg_statio_user_tables
           ORDER BY heap_blks_read DESC
           LIMIT 10`,
      );
    } catch (error) {
      return {
        data: '',
        exception: error.message,
      };
    }
  }

  /*Статистика I/O по базе данных в целом*/
  public async getDBIOInfo() {
    try {
      return await this.pgClient.query(
        `SELECT
             coalesce(datname, 'unknown') as datname,
             blks_read,  -- Всего блоков прочитано с диска
             blks_hit,   -- Всего блоков прочитано из кэша
             round(100.0 * blks_read / nullif(blks_read + blks_hit, 0), 2) AS disk_read_percent
           FROM pg_stat_database;`,
      );
    } catch (error) {
      return {
        data: '',
        exception: error.message,
      };
    }
  }

  /* Список схем и количества таблиц */
  public async getTablesCount() {
    try {
      return await this.pgClient.query(
        `SELECT schemaname, count(*) AS table_count
           FROM pg_tables
           WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
           GROUP BY schemaname
           ORDER BY count(*) DESC;`,
      );
    } catch (error) {
      return {
        data: '',
        exception: error.message,
      };
    }
  }

  /* Размер всей БД */
  public async getDbSizeAll() {
    try {
      return await this.pgClient.query(
        `SELECT pg_database_size(current_database()) /1024/1024/1024 as db_size_gb`,
      );
    } catch (error) {
      return {
        data: '',
        exception: error.message,
      };
    }
  }

  /* ТОП-10 таблиц по размеру */
  public async getDbTop10Tables() {
    try {
      return await this.pgClient.query(
        `SELECT schemaname || '.' || relname AS table_name,
         pg_total_relation_size(relid) AS size_bytes,
         pg_size_pretty(pg_total_relation_size(relid)) AS size_pretty
        FROM pg_stat_user_tables
        ORDER BY pg_total_relation_size(relid) DESC
        LIMIT 10;`,
      );
    } catch (error) {
      return {
        data: '',
        exception: error.message,
      };
    }
  }

  /* таблицы и их состояние по мертвым кортежам, состоянию автовакуума и прочему */
  public async getDbDeadTuples() {
    try {
      return await this.pgClient.query(
        `/* Статистика по таблицам */  
        with progress as (SELECT dat.datname                              AS database_name,  
                                 lower(nsp.nspname || '.' || cls.relname) as table_name,  
                                 p.phase,  
                                 p.heap_blks_total,  
                                 p.heap_blks_scanned,  
                                 p.heap_blks_vacuumed,  
                                 p.index_vacuum_count  
                          FROM pg_stat_progress_vacuum p  
                                   LEFT JOIN pg_database dat ON dat.oid = p.datid  
                                   LEFT JOIN pg_class cls ON cls.oid = p.relid  
                                   LEFT JOIN pg_namespace nsp ON nsp.oid = cls.relnamespace),  
             stats as (select table_schema,  
                              n_live_tup,  
                              n_dead_tup,  
                              last_autovacuum,  
                              last_vacuum,  
                              last_autoanalyze,  
                              last_analyze,  
                              tab_size_pretty,  
                              tab_size,  
                              case  
                                  when n_live_tup > 0 then  
                                      round(n_dead_tup * 100.0 / n_live_tup, 3)  
                                  else 0.0 end  
                                  as dead_percent  
                       from (SELECT lower((tab.schemaname::text || '.'::text)::text || tab.relname::text)           AS table_schema,  
                                    tab.n_live_tup,  
                                    tab.n_dead_tup,  
                                    tab.last_autovacuum,  
                                    tab.last_vacuum,  
                                    tab.last_autoanalyze,  
                                    tab.last_analyze,  
                                    pg_table_size((format('%I.%I', schemaname, relname))::regclass)                 AS tab_size,  
                                    pg_size_pretty(pg_table_size((format('%I.%I', schemaname, relname))::regclass)) AS tab_size_pretty  
                             FROM pg_stat_user_tables tab) q  
                       where table_schema not ilike 'pg_toast%'  
                         and table_schema not ilike 'pg_catalog%'  
                         and table_schema not ilike 'sys%'  
                         and table_schema not ilike 'information_schema%'  
                         and table_schema not ilike 'tmp.%')  
        select st.table_schema, --Схема данных + таблица  
               st.n_live_tup, --Количество живых кортежей в таблице.  
               st.n_dead_tup, --Количество мертвых кортежей в таблице  
               st.dead_percent, --Процент мертвых строк от живых строк  
               pr.phase, -- Наименование текущего статуса автовакуума по таблице  
               pr.heap_blks_total, -- общее количество блоков сканирования для автовакуума  
               pr.heap_blks_scanned, -- количество просканированных блоков операцией автовакуума  
               pr.heap_blks_vacuumed, -- количество вакуумированных блоков операцией автовакуума  
               pr.index_vacuum_count, -- количество обработанных индексов (НЕ ПЕРЕИНДЕКСАЦИЯ)  операцией автовакуума  
               st.last_autovacuum, -- дата последнего автовакуума таблицы  
               st.last_autoanalyze, -- дата последнего автоанализа таблицы  
               st.last_vacuum, -- дата последнего ручного вакуума таблицы  
               st.last_analyze, -- дата последнего ручного аанализа таблицы  
               st.tab_size_pretty -- размер таблицы в удобочитаемом виде. Для размера в байтах использовать st.tab_size  
        from stats st  
                 left join progress pr on st.table_schema = pr.table_name  
        where 1=1  
        /* Вариативные выборки для анализа */  
        -- and n_live_tup > 0 --отбор таблиц с количеством живых кортежей (строк) больше нуля  
        -- and n_dead_tup >0 --отбор таблиц с количеством мертвых кортежей (строк) больше нуля  
        --and dead_percent >0 --отбор таблиц с процентом мертвых кортежей относительно живых кортежей больше нуля  
        /* Различные сортировки по необходимости */  
        order by  
            --n_live_tup  
            --phase  
            --n_dead_tup 
            dead_percent    
             desc nulls last
             limit 100`,
      );
    } catch (error) {
      return {
        data: '',
        exception: error.message,
      };
    }
  }

  /* Список недействительных индексов и их размер  */
  public async getDbInvalidIndexes() {
    try {
      return await this.pgClient.query(
        `SELECT indexrelid::regclass AS index_name,
                  pg_relation_size(indexrelid) AS size_bytes,
                  pg_size_pretty(pg_relation_size(indexrelid)) AS size_pretty
           FROM pg_index
           WHERE NOT indisvalid;`,
      );
    } catch (error) {
      return {
        data: '',
        exception: error.message,
      };
    }
  }

  /* Тяжёлые запросы с чтением с диска   */
  public async getDbTopDiskReadQuery() {
    try {
      return await this.pgClient.query(
        `SELECT query,
                  shared_blks_read, shared_blks_hit,
                  round(CASE WHEN shared_blks_hit > 0 THEN
                         shared_blks_read * 100.0 / shared_blks_hit
                       ELSE 0 END, 2) AS disk_percent,
                  calls
           FROM pg_stat_statements
           WHERE shared_blks_hit < shared_blks_read
           ORDER BY disk_percent DESC
           LIMIT 10;`,
      );
    } catch (error) {
      return {
        data: '',
        exception: error.message,
      };
    }
  }

  /* Получение текущих параметров PostgreSQL */
  public async getPostgresParams() {
    try {
      return await this.pgClient.query(`
      SELECT name, setting, unit, boot_val, source
      FROM pg_settings
      WHERE name IN (
        'shared_buffers',
        'effective_cache_size',
        'work_mem',
        'maintenance_work_mem',
        'max_connections',
        'max_parallel_workers',
        'max_parallel_workers_per_gather',
        'max_parallel_maintenance_workers',
        'max_worker_processes',
        'autovacuum_enabled',
        'autovacuum',
        'autovacuum_max_workers',
        'autovacuum_naptime',
        'autovacuum_vacuum_cost_delay',
        'autovacuum_vacuum_cost_limit',
        'autovacuum_work_mem',
        'log_autovacuum_min_duration',
        'autovacuum_vacuum_threshold',
        'autovacuum_vacuum_scale_factor',
        'autovacuum_analyze_threshold',
        'autovacuum_analyze_scale_factor'
      )
      ORDER BY name;
    `);
    } catch (error) {
      return {
        data: '',
        exception: error.message,
      };
    }
  }

  /* Активные блокировки */
  public async getActiveLocks() {
    try {
      return await this.pgClient.query(`
      SELECT
        l.pid,
        l.locktype,
        l.mode,
        l.granted,
        l.relation::regclass AS relation,
        l.page,
        l.tuple,
        l.transactionid,
        a.state,
        a.query,
        a.query_start,
        a.wait_event_type,
        a.wait_event
      FROM pg_locks l
      LEFT JOIN pg_stat_activity a ON l.pid = a.pid
      WHERE l.granted = false
         OR (l.granted = true AND l.mode = 'AccessExclusiveLock')
      ORDER BY l.granted, a.query_start;
    `);
    } catch (error) {
      return { data: '', exception: error.message };
    }
  }

  /* Запросы, висящие дольше N секунд */
  public async getLongRunningQueries(thresholdSeconds: number = 30) {
    try {
      return await this.pgClient.query(
        `
      SELECT
        pid,
        state,
        wait_event_type,
        wait_event,
        query,
        query_start,
        EXTRACT(EPOCH FROM (now() - query_start))::integer AS duration_sec
      FROM pg_stat_activity
      WHERE state = 'active'
        AND query_start IS NOT NULL
        AND query NOT LIKE '%pg_stat_activity%'
        AND EXTRACT(EPOCH FROM (now() - query_start)) > $1
      ORDER BY duration_sec DESC
      LIMIT 50;
      `,
        [thresholdSeconds],
      );
    } catch (error) {
      return { data: '', exception: error.message };
    }
  }

  /* Транзакции в состоянии idle in transaction */
  public async getIdleInTransaction() {
    try {
      return await this.pgClient.query(`
      SELECT
        pid,
        state,
        wait_event_type,
        wait_event,
        query,
        query_start,
        xact_start,
        EXTRACT(EPOCH FROM (now() - xact_start))::integer AS idle_duration_sec,
        application_name
      FROM pg_stat_activity
      WHERE state = 'idle in transaction'
        AND xact_start IS NOT NULL
      ORDER BY idle_duration_sec DESC
      LIMIT 50;
    `);
    } catch (error) {
      return { data: '', exception: error.message };
    }
  }

  /* Статистика использования индексов */
  public async getIndexStats() {
    try {
      return await this.pgClient.query(`
        SELECT

          i.schemaname AS schema_name,
          i.relname AS table_name,
          i.indexrelname AS index_name,
          idx_scan,
          idx_tup_read,
          idx_tup_fetch,
          pg_relation_size(indexrelid) AS index_size_bytes,
          pg_size_pretty(pg_relation_size(indexrelid)) AS index_size_pretty,
          idx_blks_read,
          idx_blks_hit,
          CASE
            WHEN (idx_blks_read + idx_blks_hit) > 0
              THEN round(100.0 * idx_blks_hit / (idx_blks_read + idx_blks_hit), 2)
            ELSE 0
            END AS cache_hit_ratio
        FROM pg_stat_user_indexes i
               JOIN pg_statio_user_indexes si USING (indexrelid)
        ORDER BY idx_scan, pg_relation_size(indexrelid) DESC
        LIMIT 50
    `);
    } catch (error) {
      return { data: '', exception: error.message };
    }
  }

  /* Статистика подключений */
  public async getConnectionStats() {
    try {
      return await this.pgClient.query(`
      SELECT
        d.datname AS database_name,
        d.numbackends AS current_connections,
        s.setting::integer AS max_connections,
        round(100.0 * d.numbackends / s.setting::integer, 2) AS connection_pct,
        (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') AS active_queries,
        (SELECT count(*) FROM pg_stat_activity WHERE state = 'idle') AS idle_connections,
        (SELECT count(*) FROM pg_stat_activity WHERE state = 'idle in transaction') AS idle_in_transaction,
        (SELECT count(*) FROM pg_stat_activity WHERE wait_event_type IS NOT NULL) AS waiting_queries
      FROM pg_stat_database d
      CROSS JOIN pg_settings s
      WHERE d.datname = current_database()
        AND s.name = 'max_connections';
    `);
    } catch (error) {
      return { data: '', exception: error.message };
    }
  }

  /* Показатель QPS (среднее количество запросов в секунду) */
  public async getQPS() {
    try {
      return await this.pgClient.query(`
          WITH t1 AS (
            SELECT sum(calls) n FROM pg_stat_statements
          ),
          t2 AS (
            SELECT sum(calls) n FROM pg_stat_statements, pg_sleep(2)
          )
          SELECT round((t2.n - t1.n)/2, 0) AS qps FROM t1, t2;`);
    } catch (error) {
      return { data: '', exception: error.message };
    }
  }
}
