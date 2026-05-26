/* Виджет "Сводка проблем" */

import React, { useEffect, useState } from 'react';
import { getDashboardSummary } from '../../api/postgresApi';
import './dashboard-summary.css';

interface SummaryData {
  high_dead_tuples: number;
  invalid_indexes: number;
  deviated_params: number;
  cache_hit_ratio: number;
}

interface DashboardSummaryProps {
  onNavigate: (page: string) => void;
}

const DashboardSummary: React.FC<DashboardSummaryProps> = ({ onNavigate }) => {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await getDashboardSummary();
        //console.log('Dashboard summary data:', data);
        setSummary(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
    const interval = setInterval(fetchSummary, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="dashboard-summary loading">Загрузка сводки...</div>;
  if (!summary) return null;

  const scrollToWidget = (titleText: string) => {
    const widgets = document.querySelectorAll('.widget');
    Array.from(widgets).forEach((widget) => {
      const titleEl = widget.querySelector('.title');
      if (titleEl && titleEl.textContent?.trim() === titleText) {
        widget.scrollIntoView({ behavior: 'smooth', block: 'start' });
        (widget as HTMLElement).style.transition = 'box-shadow 0.2s';
        (widget as HTMLElement).style.boxShadow = '0 0 0 2px var(--accent-blue)';
        setTimeout(() => {
          (widget as HTMLElement).style.boxShadow = '';
        }, 1500);
      }
    });
  };

  const handleDeadTuplesClick = () => {
    onNavigate('db-state');
    setTimeout(() => scrollToWidget('Мёртвые кортежи'), 100);
  };

  const handleInvalidIndexesClick = () => {
    onNavigate('indexes');
    setTimeout(() => scrollToWidget('Статистика использования индексов'), 100);
  };

  const handleDeviatedParamsClick = () => {
    onNavigate('postgres-params');
    setTimeout(() => scrollToWidget('Сравнение параметров'), 100);
  };

  return (
      <div className="dashboard-summary">
        <div className="summary-title">Сводка проблем</div>
        <div className="summary-stats">
          <div className="stat-item clickable" onClick={handleDeadTuplesClick}>
            <span className="stat-label">Мёртвых кортежей &gt;10%:</span>
            <span className={`stat-value ${summary.high_dead_tuples > 0 ? 'critical' : 'ok'}`}>{summary.high_dead_tuples}</span>
          </div>
          <div className="stat-item clickable" onClick={handleInvalidIndexesClick}>
            <span className="stat-label">Неиспользуемых индексов:</span>
            <span className={`stat-value ${summary.invalid_indexes > 0 ? 'critical' : 'ok'}`}>{summary.invalid_indexes}</span>
          </div>
          <div className="stat-item clickable" onClick={handleDeviatedParamsClick}>
            <span className="stat-label">Параметров с отклонением:</span>
            <span className={`stat-value ${summary.deviated_params > 0 ? 'warning' : 'ok'}`}>{summary.deviated_params}</span>
          </div>
        </div>
      </div>
  );
};

export default DashboardSummary;