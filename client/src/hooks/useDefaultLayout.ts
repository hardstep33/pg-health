/* Расположение виджетов по умолчанию на первом старте */
import { useEffect } from 'react';

const DEFAULT_SETTINGS: Record<string, string> = {
  'app-theme': 'visual-studio',
  'widget-postgres-params-reference-expanded': 'false',
  'dashboard-db-state': JSON.stringify({
    order: [
      'os-version',
      'db-version',
      'ram-size',
      'cpu-size',
      'database-size',
      'qps-widget',
      'connection-stats',
      'dead-tuples',
      'top-disk-read-queries',
      'disk-io-wait',
      'top10-tables',
      'tables-count',
      'disk-read-percent',
      'database-io',
    ],
    sizes: {
      'db-version': { width: 316, height: 126 },
      'tables-count': { width: 318, height: 467 },
      'top10-tables': { width: 458, height: 468 },
      'disk-read-percent': { width: 1630, height: 380 },
      'database-io': { width: 1630, height: 351 },
      'connection-stats': { width: 1630, height: 119 },
      'dead-tuples': { width: 1648, height: 669 },
      'top-disk-read-queries': { width: 1630, height: 506 },
      'ram-size': { width: 198, height: 117 },
      'cpu-size': { width: 233, height: 115 },
      'os-version': { width: 198, height: 114 },
      'database-size': { width: 198, height: 116 },
      'disk-io-wait': { width: 1630, height: 363 },
      'qps-widget': { width: 198, height: 115 },
    },
  }),
  'dashboard-indexes': JSON.stringify({
    order: ['invalid-indexes', 'index-stats'],
    sizes: {
      'invalid-indexes': { width: 1630, height: 150 },
      'index-stats': { width: 1630, height: 770 },
    },
  }),
  'dashboard-locks-transactions': JSON.stringify({
    order: ['active-locks', 'long-running-queries', 'idle-in-transaction'],
    sizes: {},
  }),
  'dashboard-postgres-params': JSON.stringify({
    order: ['params-cpu-size', 'params-ram-size', 'params-db-size', 'params-comparison'],
    sizes: {
      'params-comparison': { width: 1630, height: 1935 },
    },
  }),
  'dashboard-replication': JSON.stringify({
    order: ['replication-stats', 'replication-slots'],
    sizes: {},
  }),
};

export const useDefaultLayout = () => {
  useEffect(() => {
    Object.entries(DEFAULT_SETTINGS).forEach(([key, defaultValue]) => {
      if (localStorage.getItem(key) === null) {
        localStorage.setItem(key, defaultValue);
      }
    });
  }, []);
};