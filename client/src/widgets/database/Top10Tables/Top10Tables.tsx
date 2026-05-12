import React from 'react';

interface TopTable {
    table_name: string;
    size_pretty: string;
}

interface Top10TablesProps {
    data: TopTable[] | null;
    error: string;
    errorTooltip?: string;
}

const Top10Tables: React.FC<Top10TablesProps> = ({ data, error, errorTooltip }) => {
    if (error) {
        return (
            <span className="error" title={errorTooltip || error}>
        нет данных
      </span>
        );
    }
    if (!data) return null;
    return (
        <ol className="top-list">
            {data.map(t => (
                <li key={t.table_name}>
                    <strong>{t.table_name}</strong> — {t.size_pretty}
                </li>
            ))}
        </ol>
    );
};

export default Top10Tables;