import React, { useState, useEffect } from 'react';

interface ParamInfo {
  name: string;
  recommendation: string;
  description: string;
}

const params: ParamInfo[] = [
  {
    name: 'shared_buffers',
    recommendation:
      '25% от RAM (но не более 8GB на PostgreSQL < 11, до 32GB на новых)',
    description:
      'Основной кэш PostgreSQL для хранения страниц данных в оперативной памяти.',
  },
  {
    name: 'effective_cache_size',
    recommendation: '50–75% от RAM',
    description:
      'Оценка объёма кэша ОС + shared_buffers. Используется планировщиком для выбора оптимального плана запроса (индексное сканирование vs seq scan).',
  },
  {
    name: 'work_mem',
    recommendation:
      '(RAM — shared_buffers) / max_connections / 4 (для OLTP). Для reporting: больше.',
    description:
      'Объём памяти для одной операции сортировки или хеш-таблицы на каждого клиента. Может использоваться несколько раз в одном запросе.',
  },
  {
    name: 'maintenance_work_mem',
    recommendation:
      '5–10% от RAM, но не более 1GB. Для больших БД можно до 2GB.',
    description:
      'Память для VACUUM, CREATE INDEX, ALTER TABLE. Увеличивает скорость обслуживания.',
  },
  {
    name: 'max_connections',
    recommendation:
      'По нагрузке. Обычно 100–500 для средних систем. Каждое соединение потребляет ~2–5MB RAM.',
    description:
      'Максимальное количество одновременных подключений к серверу. При нехватке — использовать пулер соединений (PgBouncer).',
  },
  {
    name: 'max_parallel_workers',
    recommendation:
      'Количество ядер CPU (но не более 8–16 на интенсивных OLTP системах)',
    description:
      'Максимальное количество параллельных рабочих процессов для всех параллельных запросов.',
  },
  {
    name: 'max_parallel_workers_per_gather',
    recommendation: '50% от max_parallel_workers, но не более 4 на OLTP',
    description:
      'Максимальное количество рабочих процессов на один узел Gather (Parallel Seq Scan, Parallel Index Scan).',
  },
  {
    name: 'max_parallel_maintenance_workers',
    recommendation: '20–30% от max_parallel_workers',
    description:
      'Максимальное количество параллельных процессов для обслуживания (CREATE INDEX с параллельной сортировкой).',
  },
  {
    name: 'max_worker_processes',
    recommendation: 'max_parallel_workers + autovacuum_max_workers + запас 2–4',
    description:
      'Общее максимальное количество фоновых процессов (включает все параллельные и autovacuum workers).',
  },
  {
    name: 'autovacuum_max_workers',
    recommendation: '1 процесс на каждые 3–4 ядра CPU',
    description:
      'Максимальное количество одновременно работающих процессов autovacuum. При большом количестве таблиц с частыми изменениями — увеличить.',
  },
  {
    name: 'autovacuum_naptime',
    recommendation:
      '1 min (по умолчанию, можно уменьшить до 30s для активно изменяемых БД)',
    description:
      'Интервал между проверками необходимости запуска autovacuum. Уменьшение снижает задержки очистки.',
  },
  {
    name: 'autovacuum_vacuum_cost_delay',
    recommendation: '2ms для SSD, 10ms для HDD. 0 — без задержек (агрессивно)',
    description:
      'Задержка между «порциями» работы autovacuum. Меньше — быстрее очистка, но выше нагрузка на диск.',
  },
  {
    name: 'autovacuum_vacuum_cost_limit',
    recommendation: '2000 для SSD, 200 для HDD. Выше = больше работы за цикл.',
    description:
      'Лимит стоимости работы autovacuum. При достижении лимита autovacuum делает паузу. Увеличение ускоряет очистку.',
  },
  {
    name: 'autovacuum_work_mem',
    recommendation:
      'maintenance_work_mem / autovacuum_max_workers, но не менее 64MB. Если -1 — используется maintenance_work_mem.',
    description:
      'Память для одного процесса autovacuum. Используется для хранения списка идентификаторов мёртвых строк. Недостаток памяти приводит к нескольким проходам vacuum. Значение -1 (по умолчанию) означает, что используется maintenance_work_mem.',
  },
  {
    name: 'log_autovacuum_min_duration',
    recommendation: '0 (логировать все) или 1000ms (только долгие)',
    description:
      'Логирование операций autovacuum, выполнявшихся дольше указанного времени. 0 — все операции. Полезно для мониторинга.',
  },
  {
    name: 'autovacuum_vacuum_threshold',
    recommendation: 'По умолчанию 50. Уменьшить для больших таблиц.',
    description:
      'Минимальное количество изменённых/удалённых строк, после которого autovacuum запускает очистку таблицы.',
  },
  {
    name: 'autovacuum_vacuum_scale_factor',
    recommendation:
      'По умолчанию 0.2. Уменьшить до 0.01–0.05 для больших таблиц.',
    description:
      'Доля изменённых строк от общего количества, после которой запускается autovacuum. Для больших таблиц 20% — слишком много.',
  },
  {
    name: 'autovacuum_analyze_threshold',
    recommendation: 'По умолчанию 50. Аналогично vacuum_threshold.',
    description:
      'Минимальное количество изменённых строк для запуска автоанализа (обновления статистики).',
  },
  {
    name: 'autovacuum_analyze_scale_factor',
    recommendation:
      'По умолчанию 0.1. Для больших таблиц уменьшить до 0.01–0.05.',
    description:
      'Доля изменённых строк для запуска автоанализа. Устаревшая статистика ведёт к плохим планам запросов.',
  },
  {
    name: 'autovacuum (autovacuum_enabled)',
    recommendation:
      'ON (по умолчанию). Отключать только в исключительных случаях.',
    description:
      'Глобальное управление демоном автовакуума. В PG 12 — autovacuum_enabled, в PG 13+ — autovacuum. При отключении мёртвые строки не очищаются.',
  },
];

const STORAGE_KEY = 'widget-postgres-params-reference-expanded';

function loadExpandedState(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      return JSON.parse(raw);
    }
  } catch (e) {
    // ignore
  }
  return false; // по умолчанию свёрнут
}

function saveExpandedState(expanded: boolean) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expanded));
}

const PostgresParamsReference: React.FC = () => {
  const [expanded, setExpanded] = useState<boolean>(loadExpandedState);

  useEffect(() => {
    saveExpandedState(expanded);
  }, [expanded]);

  const toggleExpanded = () => {
    setExpanded((prev) => !prev);
  };

  return (
    <div className="widget reference-widget">
      <div
        className="widget-header"
        onClick={toggleExpanded}
        style={{ cursor: 'pointer' }}
      >
        <span className="title">
          {expanded ? '▼' : '▶'} Справка по критичным параметрам PostgreSQL
        </span>
      </div>
      {expanded && (
        <div className="widget-body">
          <table className="data-table">
            <thead>
              <tr>
                <th>Параметр</th>
                <th>Рекомендация</th>
                <th>Описание</th>
              </tr>
            </thead>
            <tbody>
              {params.map((p) => (
                <tr key={p.name}>
                  <td>
                    <code>{p.name}</code>
                  </td>
                  <td>{p.recommendation}</td>
                  <td>{p.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PostgresParamsReference;
