import React from 'react';
import { formatBytes, formatMs, convertParamValue } from '../../../utils/convertParamValue';
import { useSort } from '../../../hooks/useSort';

interface ParamSetting {
    name: string;
    setting: string;
    unit: string | null;
    boot_val: string;
    source: string;
}

interface Recommendation {
    name: string;
    currentValue: number;
    recommendedValue: number;
    recommendationText: string;
    isOk: boolean;
    formattedCurrent: string;
    formattedRecommended: string;
}

interface ParamsComparisonProps {
    data: ParamSetting[] | null;
    error: string;
    errorTooltip?: string;
    totalRamGb: number | null;
    cpuCores: number | null;
}

const ParamsComparison: React.FC<ParamsComparisonProps> = ({
                                                               data,
                                                               error,
                                                               errorTooltip,
                                                               totalRamGb,
                                                               cpuCores,
                                                           }) => {
    const totalRamGbSafe = (totalRamGb !== null && !isNaN(totalRamGb)) ? totalRamGb : 0;
    const cpuCoresSafe = (cpuCores !== null && !isNaN(cpuCores)) ? cpuCores : 0;
    const totalRamBytes = totalRamGbSafe * 1024 * 1024 * 1024;

    const settingsMap: Record<string, ParamSetting> = {};
    if (data) {
        data.forEach(s => { settingsMap[s.name] = s; });
    }

    const getVal = (name: string): number => {
        const s = settingsMap[name];
        if (!s) return 0;
        if (name === 'autovacuum_work_mem' && s.setting === '-1') {
            return getVal('maintenance_work_mem');
        }
        return convertParamValue(s.setting, s.unit);
    };

    const autovacuumEnabledSetting = settingsMap['autovacuum_enabled'] || settingsMap['autovacuum'];
    const autovacuumEnabledValue = autovacuumEnabledSetting
        ? convertParamValue(autovacuumEnabledSetting.setting, autovacuumEnabledSetting.unit)
        : 0;

    const maxConnections = getVal('max_connections') || 100;
    const storageType = 'SSD';

    const recommendationsList: Recommendation[] = [
        {
            name: 'shared_buffers',
            currentValue: getVal('shared_buffers'),
            recommendedValue: totalRamGbSafe > 0 ? totalRamBytes / 4 : 0,
            recommendationText: 'Рекомендуется 25% от RAM.',
            isOk: false,
            formattedCurrent: '',
            formattedRecommended: '',
        },
        {
            name: 'effective_cache_size',
            currentValue: getVal('effective_cache_size'),
            recommendedValue: totalRamGbSafe > 0 ? totalRamBytes * 0.75 : 0,
            recommendationText: 'Рекомендуется 75% от RAM.' +
                '\nПараметр не выделяет память, а лишь подсказывает планировщику, сколько данных может кэшироваться операционной системой и Postgres.' +
                '\nБолее высокое значение побуждает планировщик чаще использовать индексы (index scan).' +
                '\nСлишком низкое значение заставляет планировщик предпочитать seq scan, что медленнее.' +
                '\nПараметр не влияет на реальное потребление памяти, а только на работу планировщика запросов.',
            isOk: false,
            formattedCurrent: '',
            formattedRecommended: '',
        },
        {
            name: 'work_mem',
            currentValue: getVal('work_mem'),
            recommendedValue: totalRamGbSafe > 0
                ? Math.floor((totalRamBytes - Math.min(totalRamBytes * 0.25, 8 * 1024 * 1024 * 1024)) / maxConnections / 4)
                : 0,
            recommendationText: 'Максимальное значение рассчитывается как (RAM - shared_buffers) / max_connections / 4' +
                '\nОпределяет объем оперативной памяти, выделяемой для каждой операции сортировки (ORDER BY, DISTINCT) и хеш-таблиц (HASH JOIN, хеш-агрегация) перед тем, как данные начнут записываться во временные файлы на диске' +
                '\n\n- OLTP (высокая нагрузка, много мелких запросов): 4 МБ — 16 МБ.' +
                '\n- Смешанная нагрузка / Веб-приложения: 16 МБ — 64 МБ.' +
                '\n- Аналитика (OLAP), тяжелые сортировки: 64 МБ — 256 МБ+' +
                '\n\nЗначение необходимо подбирать индивидуально вручную, на основе анализа запросов',
            isOk: false,
            formattedCurrent: '',
            formattedRecommended: '',
        },
        {
            name: 'maintenance_work_mem',
            currentValue: getVal('maintenance_work_mem'),
            recommendedValue: totalRamGbSafe > 0 ? Math.min(totalRamBytes * 0.1, 1 * 1024 * 1024 * 1024) : 0,
            recommendationText: 'Рекомендуется 5-10% от общего объема ОЗУ. ' +
                '\n- Для небольших баз (до 4 ГБ ОЗУ): 128–512 МБ.' +
                '\n- Для средних и крупных баз: 5–10% от общей ОЗУ, обычно достаточно 1 ГБ, максимум до 2-4 ГБ.' +
                '\n- При интенсивном создании индексов: Увеличение параметра значительно ускоряет эти операции.' +
                '\n\nВажно: Слишком большое значение может привести к нехватке памяти (OOM-killer) при параллельных операциях обслуживания',
            isOk: false,
            formattedCurrent: '',
            formattedRecommended: '',
        },
        {
            name: 'max_connections',
            currentValue: getVal('max_connections'),
            recommendedValue: 200,
            recommendationText: 'Общая формула: количество активных запросов не должно превышать число ядер процессора, умноженное на 2-4.' +
                '\n\nЕсли тысячи клиентов, лучше установить max_connections в районе 100-300, а управление тысячами соединений возложить на PgBouncer.',
            isOk: false,
            formattedCurrent: '',
            formattedRecommended: '',
        },
        {
            name: 'max_parallel_workers',
            currentValue: getVal('max_parallel_workers'),
            recommendedValue: cpuCoresSafe > 0 ? Math.min(cpuCoresSafe, 8) : 0,
            recommendationText: 'Зависит от количества ядер процессора и типа нагрузки (OLTP или OLAP). Этот параметр задает максимальное число рабочих процессов для параллельных операций (сканирование, объединение).' +
                '\n\n- Базовая рекомендация (многоядерные системы): Значение, равное общему количеству CPU.' +
                '\n- Для активных серверов (OLTP): Значение, равное или чуть меньше половины количества CPU, чтобы не перегрузить систему.' +
                '\n- Для аналитических серверов (OLAP): Значение, равное общему числу логических процессоров.',
            isOk: false,
            formattedCurrent: '',
            formattedRecommended: '',
        },
        {
            name: 'max_parallel_workers_per_gather',
            currentValue: getVal('max_parallel_workers_per_gather'),
            recommendedValue: cpuCoresSafe > 0 ? Math.min(Math.floor(cpuCoresSafe / 2), 4) : 0,
            recommendationText: 'Рекомендуется 50% от max_parallel_workers, но не более 4' +
                '\nПараметр задает максимальное число рабочих процессов (воркеров), запускаемых одним узлом Gather (параллельный план запроса)' +
                '\n\n- Для систем 1С: CPU/2 или ориентироваться на 25% от RAM для общего параллелизма, но max_parallel_workers_per_gather обычно держат в пределах 2–6' +
                '\n- Для OLTP: Если запросов много, лучше выставлять 2-4, чтобы один большой запрос не съел все ресурсы',
            isOk: false,
            formattedCurrent: '',
            formattedRecommended: '',
        },
        {
            name: 'max_parallel_maintenance_workers',
            currentValue: getVal('max_parallel_maintenance_workers'),
            recommendedValue: cpuCoresSafe > 0 ? Math.max(Math.floor(cpuCoresSafe * 0.25), 4) : 0,
            recommendationText: 'Параметр влияет на скорость обслуживания (создание индексов, VACUUM).' +
                '\n\nОбщая рекомендация: 25% от max_parallel_workers' +
                '\n\n Важно! Убедитесь, что max_parallel_maintenance_workers меньше, чем max_parallel_workers.',
            isOk: false,
            formattedCurrent: '',
            formattedRecommended: '',
        },
        {
            name: 'max_worker_processes',
            currentValue: getVal('max_worker_processes'),
            recommendedValue: cpuCoresSafe > 0  ? cpuCoresSafe : 0,
            recommendationText: 'Значение равно количеству CPU' +
                '\nДля большинства систем начать с равенства CPU  и проводить нагрузочное тестирование. Если CPU загружен менее чем на 30%, можно плавно увеличивать параметр, вплоть до CPU * 2',
            isOk: false,
            formattedCurrent: '',
            formattedRecommended: '',
        },
        {
            name: 'autovacuum_enabled',
            currentValue: autovacuumEnabledValue,
            recommendedValue: 1,
            recommendationText: 'Глобальное управление автовакуумом.' +
                '\nДолжен быть ON. OFF — только для спецопераций' +
                '\nВ зависимости от версии PG значение может быть autovacuum_enabled или просто autovacuum',
            isOk: false,
            formattedCurrent: '',
            formattedRecommended: '',
        },
        {
            name: 'autovacuum_max_workers',
            currentValue: getVal('autovacuum_max_workers'),
            recommendedValue: cpuCoresSafe > 0 ? Math.max(Math.ceil(cpuCoresSafe / 3), 1) : 0,
            recommendationText: 'Рекомендуется 1 процесс на каждые 3 ядра CPU.' +
                '\n\n 1 worker обрабатывает 1 таблицу. Точное значение параметра выставляется в зависимости от интенсивности автовакуума и количества обрабатываемых таблиц',
            isOk: false,
            formattedCurrent: '',
            formattedRecommended: '',
        },
        {
            name: 'autovacuum_naptime',
            currentValue: getVal('autovacuum_naptime'),
            recommendedValue: 60 * 1000,
            recommendationText: 'Минимальная задержка между запусками автоочистки для базы данных. ' +
                '\nПо умолчанию 1min. Можно уменьшить до 30s для активно изменяемых БД',
            isOk: false,
            formattedCurrent: '',
            formattedRecommended: '',
        },
        {
            name: 'autovacuum_vacuum_cost_delay',
            currentValue: getVal('autovacuum_vacuum_cost_delay'),
            recommendedValue: storageType === 'SSD' ? 2 : 10,
            recommendationText: 'Задаёт задержку при превышении предела стоимости, которая будет применяться при автоматических операциях VACUUM.' +
                '\n\n- NVMe/SSD: 2 ms. Возможно уменьшение до 0-1 ms' +
                '\n- HDD или высокая нагрузка I/O: Увеличение значения до 10-20 ms. Это заставит вакуум делать более длительные паузы, снижая нагрузку на диск.' +
                '\n- Большие БД с интенсивным UPDATE/DELETE: Вместо увеличения autovacuum_vacuum_cost_delay, рекомендуется увеличить autovacuum_vacuum_cost_limit (например, до 1000-2000), чтобы вакуум мог сделать больше работы за один цикл до включения задержки.',
            isOk: false,
            formattedCurrent: '',
            formattedRecommended: '',
        },
        {
            name: 'autovacuum_vacuum_cost_limit',
            currentValue: getVal('autovacuum_vacuum_cost_limit'),
            recommendedValue: storageType === 'SSD' ? 2000 : 200,
            recommendationText: '2000 для SSD, 200 для HDD' +
                '\n\n- При значении "-1"  применяется значение vacuum_cost_limit (200 по умолчанию).' +
                '\n- Распределение: Если работает несколько воркеров (процессов) автовакуума, этот лимит делится между ними пропорционально.' +
                '\n- Агрессивный вакуум: При высоких значениях autovacuum_vacuum_cost_limit сервер становится более агрессивным в очистке мусора, что освобождает место быстрее, но нагружает дисковую подсистему',
            isOk: false,
            formattedCurrent: '',
            formattedRecommended: '',
        },
        {
            name: 'autovacuum_work_mem',
            currentValue: getVal('autovacuum_work_mem'),
            recommendedValue: totalRamGbSafe > 0 && cpuCoresSafe > 0
                ? 256 * 1024 * 1024 : 0,
            recommendationText: 'maintenance_work_mem / autovacuum_max_workers, но не менее 64MB.' +
                '\n\n- Если -1 — используется maintenance_work_mem.' +
                '\n- Минимальное рекомендуемое значение: 64–256 МБ для средних баз данных.' +
                '\n- Для высоконагруженных систем: Рекомендуется устанавливать от 512 МБ до 1 ГБ (или даже больше, если позволяет RAM и много активных таблиц), но максимально эффективное ограничение - 1 ГБ на один процесс автоочистки',
            isOk: false,
            formattedCurrent: '',
            formattedRecommended: '',
        },
        {
            name: 'log_autovacuum_min_duration',
            currentValue: getVal('log_autovacuum_min_duration'),
            recommendedValue: 0,
            recommendationText: '0ms — логировать все операции autovacuum для мониторинга',
            isOk: false,
            formattedCurrent: '',
            formattedRecommended: '',
        },
        {
            name: 'autovacuum_vacuum_threshold',
            currentValue: getVal('autovacuum_vacuum_threshold'),
            recommendedValue: 50,
            recommendationText: 'Минимальное фиксированное количество измененных строк в таблице, по достижению которых запускается автовакуум.' +
                '\n\n Параметр работает в связке с autovacuum_vacuum_scale_factor.' +
                '\nПорог срабатывания = autovacuum_vacuum_threshold + (количество строк в таблице * autovacuum_vacuum_scale_factor)',
            isOk: false,
            formattedCurrent: '',
            formattedRecommended: '',
        },
        {
            name: 'autovacuum_vacuum_scale_factor',
            currentValue: getVal('autovacuum_vacuum_scale_factor'),
            recommendedValue: 0.05,
            recommendationText: 'Минимальное количество измененных строк в таблице в процентах от общего количества строк таблицы, по достижению которых запускается автовакуум.' +
                '\n\nЗначение 0.05 означает 5% от общего числа строк таблицы.' +
                '\nТаким образом, при количестве строк таблицы в 1000, autovacuum_vacuum_threshold = 50 и autovacuum_vacuum_scale_factor = 0.05, автовакуум запустится при достижении 50 + (1000 * 0,05) = 100 мертвых кортежей',
            isOk: false,
            formattedCurrent: '',
            formattedRecommended: '',
        },
        {
            name: 'autovacuum_analyze_threshold',
            currentValue: getVal('autovacuum_analyze_threshold'),
            recommendedValue: 50,
            recommendationText: 'Минимальное фиксированное количество измененных строк в таблице, по достижению которых запускается автоанализ.' +
                '\n\n Параметр работает в связке с autovacuum_analyze_scale_factor.' +
                '\nПорог срабатывания = autovacuum_analyze_threshold + (количество строк в таблице * autovacuum_analyze_scale_factor)',
            isOk: false,
            formattedCurrent: '',
            formattedRecommended: '',
        },
        {
            name: 'autovacuum_analyze_scale_factor',
            currentValue: getVal('autovacuum_analyze_scale_factor'),
            recommendedValue: 0.05,
            recommendationText: 'Минимальное количество измененных строк в таблице в процентах от общего количества строк таблицы, по достижению которых запускается автоанализ.' +
                '\n\nЗначение 0.05 означает 5% от общего числа строк таблицы.' +
                '\nТаким образом, при количестве строк таблицы в 1000, autovacuum_analyze_threshold = 50 и autovacuum_analyze_scale_factor = 0.05, автоанализ запустится при достижении 50 + (1000 * 0,05) = 100 мертвых кортежей',
            isOk: false,
            formattedCurrent: '',
            formattedRecommended: '',
        },
    ];

    // Форматируем значения
    recommendationsList.forEach(r => {
        let s = settingsMap[r.name];
        if (!s && r.name === 'autovacuum_enabled') {
            s = settingsMap['autovacuum'];
        }

        if (!s) {
            r.formattedCurrent = '—';
            r.formattedRecommended = '—';
            r.isOk = false;
            return;
        }

        // Булевы
        if (s.boot_val === 'on' || s.boot_val === 'off') {
            r.formattedCurrent = s.setting === 'on' ? 'ON' : 'OFF';
            r.formattedRecommended = r.recommendedValue === 1 ? 'ON' : 'OFF';
            r.isOk = (s.setting === 'on') === (r.recommendedValue === 1);
            return;
        }

        // max_connections
        if (r.name === 'max_connections') {
            r.formattedCurrent = r.currentValue.toString();
            r.formattedRecommended = r.recommendedValue.toString();
            r.isOk = true;
            return;
        }

        const unit = s.unit;
        if (unit && ['8kB', 'kB', 'MB', 'GB'].includes(unit)) {
            r.formattedCurrent = formatBytes(r.currentValue);
        } else if (unit && ['ms', 's', 'min'].includes(unit)) {
            r.formattedCurrent = formatMs(r.currentValue);
        } else {
            r.formattedCurrent = r.currentValue.toString();
        }

        if (r.recommendedValue === 0) {
            if (r.name === 'log_autovacuum_min_duration') {
                r.formattedRecommended = formatMs(r.recommendedValue); // вносим исключение для параметра log_autovacuum_min_duration = "0ms"
                r.isOk = r.currentValue === 0;
                return; // заканчиваем обработку этого параметра
            }
            // Для остальных параметров: 0 означает отсутствие рекомендации
            r.formattedRecommended = '—';
            r.isOk = false;
        } else {
            if (unit && ['8kB', 'kB', 'MB', 'GB'].includes(unit)) {
                r.formattedRecommended = formatBytes(r.recommendedValue);
                r.isOk = Math.abs(r.currentValue - r.recommendedValue) / r.recommendedValue < 0.2;
            } else if (unit && ['ms', 's', 'min'].includes(unit)) {
                r.formattedRecommended = formatMs(r.recommendedValue);
                r.isOk = Math.abs(r.currentValue - r.recommendedValue) / r.recommendedValue < 0.2;
            } else {
                r.formattedRecommended = r.recommendedValue.toString();
                r.isOk = r.recommendedValue === 0
                    ? r.currentValue === 0
                    : Math.abs(r.currentValue - r.recommendedValue) / r.recommendedValue < 0.1;
            }
        }
    });

    // Хук вызван ДО всех ранних return
    const { sortedData, requestSort, getSortIndicator } = useSort(recommendationsList);

    if (error) {
        return (
            <span className="error" title={errorTooltip || error}>
        нет данных
      </span>
        );
    }

    if (!data) {
        return <span>Ожидание данных...</span>;
    }

    return (
        <div className="table-wrapper">
            <table className="data-table">
                <thead>
                <tr>
                    <th className="sortable" onClick={() => requestSort('name')}>
                        Параметр{getSortIndicator('name')}
                    </th>
                    <th className="sortable" onClick={() => requestSort('formattedCurrent')}>
                        Текущее значение{getSortIndicator('formattedCurrent')}
                    </th>
                    <th className="sortable" onClick={() => requestSort('formattedRecommended')}>
                        Рекомендуемое значение{getSortIndicator('formattedRecommended')}
                    </th>
                    <th className="sortable" onClick={() => requestSort('isOk')}>
                        Статус{getSortIndicator('isOk')}
                    </th>
                    <th className="sortable" onClick={() => requestSort('recommendationText')}>
                        Рекомендация{getSortIndicator('recommendationText')}
                    </th>
                </tr>
                </thead>
                <tbody>
                {sortedData.map(r => (
                    <tr key={r.name} className={!r.isOk ? 'row-warning' : 'row-ok'}>
                        <td>
                            <code>
                                {r.name === 'autovacuum_enabled'
                                    ? settingsMap['autovacuum']
                                        ? 'autovacuum'
                                        : 'autovacuum_enabled'
                                    : r.name}
                            </code>
                        </td>
                        <td>{r.formattedCurrent}</td>
                        <td>{r.formattedRecommended}</td>
                        <td>{r.isOk ? '✓ OK' : '⚠️ Отклонение'}</td>
                        <td className="recommendation-cell">{r.recommendationText}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default ParamsComparison;