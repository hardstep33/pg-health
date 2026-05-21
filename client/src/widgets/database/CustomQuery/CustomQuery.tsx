import React, { useState } from 'react';
import { format } from 'sql-formatter';
import './custom-query.css';

interface CustomQueryProps {
    onExecute: (query: string) => Promise<any>;
    error?: string;
    isLoading?: boolean;
}

const CustomQuery: React.FC<CustomQueryProps> = ({ onExecute, error, isLoading }) => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<any[] | null>(null);
    const [execError, setExecError] = useState<string | null>(null);
    const [localLoading, setLocalLoading] = useState(false);

    const handleExecute = async () => {
        if (!query.trim()) {
            setExecError('Введите SQL запрос');
            return;
        }
        setLocalLoading(true);
        setExecError(null);
        try {
            const response = await onExecute(query);
            if (response.error) {
                setExecError(response.error);
                setResult(null);
            } else {
                setResult(response.rows || []);
                setExecError(null);
            }
        } catch (err: any) {
            setExecError(err.message || 'Ошибка выполнения запроса');
            setResult(null);
        } finally {
            setLocalLoading(false);
        }
    };

    const handleClear = () => {
        setQuery('');
        setResult(null);
        setExecError(null);
    };

    const handleFormat = () => {
        if (!query.trim()) return;
        try {
            const formatted = format(query, { language: 'postgresql' });
            setQuery(formatted);
        } catch (err) {
            // ignore format errors
        }
    };

    const renderTable = () => {
        if (!result || result.length === 0) return <p>Нет данных</p>;
        const columns = Object.keys(result[0]);
        return (
            <div className="table-wrapper" style={{ maxHeight: '400px', overflow: 'auto' }}>
                <table className="data-table">
                    <thead>
                    <tr>
                        {columns.map(col => <th key={col}>{col}</th>)}
                    </tr>
                    </thead>
                    <tbody>
                    {result.map((row, idx) => (
                        <tr key={idx}>
                            {columns.map(col => <td key={col}>{String(row[col])}</td>)}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const loading = isLoading || localLoading;

    return (
        <div className="custom-query">
      <textarea
          className="custom-query-textarea"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Введите SELECT запрос..."
          rows={8}
          spellCheck={false}
      />
            <div className="custom-query-buttons">
                <button onClick={handleFormat} className="custom-query-btn format">
                    Форматировать
                </button>
                <button onClick={handleExecute} disabled={loading} className="custom-query-btn execute">
                    {loading ? 'Выполняется...' : 'Выполнить'}
                </button>
                <button onClick={handleClear} className="custom-query-btn clear">
                    Очистить
                </button>
            </div>
            {(execError || error) && (
                <div className="error" style={{ marginTop: '8px' }}>
                    {execError || error}
                </div>
            )}
            {result && renderTable()}
        </div>
    );
};

export default CustomQuery;