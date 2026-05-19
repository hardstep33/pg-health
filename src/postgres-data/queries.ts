export class SqlQuery {
    /* Получение версии БД */
    static getVersion(): string {
        return `select version()`
    }

    /* Получение версии ОС */
    static getOsVersion(): string {
        return `SELECT substring(version() FROM '\\(([^)]+)\\)[^)]*$') AS os_version`;
    }

    static getRamSize(): string {
        return `SELECT round(split_part(split_part(meminfo, ':', 2), 'k', 1)::numeric / 1024 / 1024, 0) as total_ram_gb
           FROM unnest(string_to_array(pg_read_file('/proc/meminfo', 0, 10000), chr(10))) meminfo
           WHERE meminfo LIKE 'MemTotal%';`;
    }

    static getCpuSize(): string {
        return `SELECT
             count(*) as cpu_cores
           FROM
             unnest(string_to_array(pg_read_file('/proc/cpuinfo', 0, 100000), chr(10))) x
           WHERE
             x LIKE 'processor%'`
    }

    static getOsDiskIOWait(): string {
        return `SELECT
             pid,
             state,
             wait_event_type,
             wait_event,
             query,
             backend_start
           FROM pg_stat_activity
           WHERE wait_event_type = 'IO'`
    }

    static getDiskPercentRead(): string {
        return  `SELECT
             relname AS table_name,
             heap_blks_read,
             heap_blks_hit,
             round(100.0 * heap_blks_read / nullif(heap_blks_read + heap_blks_hit, 0), 2) AS read_percent
           FROM pg_statio_user_tables
           ORDER BY heap_blks_read DESC
           LIMIT 10`
    }

    static getDBIOInfo(): string {
        return `SELECT
             coalesce(datname, 'unknown') as datname,
             blks_read,
             blks_hit,
             round(100.0 * blks_read / nullif(blks_read + blks_hit, 0), 2) AS disk_read_percent
           FROM pg_stat_database;`
    }

    static getTablesCount(): string {
        return `SELECT schemaname, count(*) AS table_count
           FROM pg_tables
           WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
           GROUP BY schemaname
           ORDER BY count(*) DESC;`
    }

    static getDbSizeAll(): string {
        return `SELECT pg_database_size(current_database()) /1024/1024/1024 as db_size_gb`
    }

    static getDbTop10Tables(): string {
        return `SELECT schemaname || '.' || relname AS table_name,
         pg_total_relation_size(relid) AS size_bytes,
         pg_size_pretty(pg_total_relation_size(relid)) AS size_pretty
        FROM pg_stat_user_tables
        ORDER BY pg_total_relation_size(relid) DESC
        LIMIT 10;`
    }

    static getDbDeadTuples(): string {
        return `/* Статистика по таблицам */  
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
        select st.table_schema,  
               st.n_live_tup,  
               st.n_dead_tup,  
               st.dead_percent,  
               pr.phase,  
               pr.heap_blks_total,  
               pr.heap_blks_scanned,  
               pr.heap_blks_vacuumed,  
               pr.index_vacuum_count,  
               st.last_autovacuum,  
               st.last_autoanalyze,  
               st.last_vacuum,  
               st.last_analyze,  
               st.tab_size_pretty  
        from stats st  
                 left join progress pr on st.table_schema = pr.table_name  
        order by dead_percent desc nulls last
        limit 100`
    }

    static getDbInvalidIndexes():string {
        return `SELECT indexrelid::regclass AS index_name,
                  pg_relation_size(indexrelid) AS size_bytes,
                  pg_size_pretty(pg_relation_size(indexrelid)) AS size_pretty
           FROM pg_index
           WHERE NOT indisvalid;`
    }

    static getDbTopDiskReadQuery(): string {
        return `SELECT query,
                  shared_blks_read, shared_blks_hit,
                  round(CASE WHEN shared_blks_hit > 0 THEN
                         shared_blks_read * 100.0 / shared_blks_hit
                       ELSE 0 END, 2) AS disk_percent,
                  calls
           FROM pg_stat_statements
           WHERE shared_blks_hit < shared_blks_read
           ORDER BY disk_percent DESC
           LIMIT 10;`
    }

    static getPostgresParams(): string {
        return `
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
      ORDER BY name;`
    }

    static getActiveLocks(): string {
        return `
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
      ORDER BY l.granted, a.query_start;`
    }

    static getLongRunningQueries(): string {
        return `
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
      LIMIT 50;`
    }

    static getIdleInTransaction(): string {
        return `
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
      LIMIT 50;`
    }

    static getIndexStats(): string {
        return `
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
        LIMIT 50`
    }

    static getConnectionStats(): string {
        return `
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
        AND s.name = 'max_connections'`
    }

    static getQPSFallback(): string {
        return `SELECT sum(calls) AS total_calls FROM pg_stat_statements;`
    }

    // --- Репликация ---
    static getReplicationStats(): string {
        return `
      SELECT
        application_name,
        client_addr,
        state,
        sync_state,
        pg_wal_lsn_diff(pg_current_wal_lsn(), replay_lsn) AS replay_lag_bytes,
        replay_lag,
        flush_lag,
        write_lag
      FROM pg_stat_replication;
      `
    }

    static getReplicationSlots(): string {
        return `
      SELECT
        slot_name,
        slot_type,
        active,
        pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn) AS wal_retained_bytes,
        active_pid
      FROM pg_replication_slots;
      `
    }

    // --- Сводка проблем и hit ratio ---
    static getDashboardSummary(): string {
        return `
      WITH
        dead_tuples_stats AS (
          SELECT count(*) AS high_dead_tuples
          FROM (
            SELECT n_live_tup, n_dead_tup,
              CASE WHEN n_live_tup > 0 THEN round(n_dead_tup * 100.0 / n_live_tup, 3) ELSE 0 END AS dead_percent
            FROM pg_stat_user_tables
          ) t
          WHERE dead_percent > 10
        ),
        invalid_indexes_stats AS (
          SELECT count(*) AS invalid_indexes
          FROM pg_index
          WHERE NOT indisvalid
        ),
        cache_hit_ratio AS (
          SELECT
            round(
              100.0 * sum(blks_hit) / nullif(sum(blks_hit + blks_read), 0), 2
            ) AS hit_ratio
          FROM pg_stat_database
          WHERE datname = current_database()
        )
      SELECT
        (SELECT high_dead_tuples FROM dead_tuples_stats) AS high_dead_tuples,
        (SELECT invalid_indexes FROM invalid_indexes_stats) AS invalid_indexes,
        (SELECT hit_ratio FROM cache_hit_ratio) AS cache_hit_ratio;
      `
    }

    // Для получения отклонений параметров используем отдельный запрос, но лучше переиспользовать ParamsComparison логику на бэкенде
    // Сделаем эндпоинт /db/params-summary, который возвращает количество параметров с отклонением
    static getParamsSummary(): string {
        return `
      SELECT name, setting, unit, boot_val
      FROM pg_settings
      WHERE name IN (
        'shared_buffers', 'effective_cache_size', 'work_mem', 'maintenance_work_mem',
        'max_connections', 'max_parallel_workers', 'max_parallel_workers_per_gather',
        'max_parallel_maintenance_workers', 'max_worker_processes', 'autovacuum_enabled',
        'autovacuum_max_workers', 'autovacuum_naptime', 'autovacuum_vacuum_cost_delay',
        'autovacuum_vacuum_cost_limit', 'autovacuum_work_mem', 'log_autovacuum_min_duration',
        'autovacuum_vacuum_threshold', 'autovacuum_vacuum_scale_factor',
        'autovacuum_analyze_threshold', 'autovacuum_analyze_scale_factor', 'autovacuum'
      );
      `
    }
}