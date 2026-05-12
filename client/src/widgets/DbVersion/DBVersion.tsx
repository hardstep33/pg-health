import React from 'react';

interface DbVersionProps {
    data: any;
    error: string;
    errorTooltip?: string;
}

const DbVersion: React.FC<DbVersionProps> = ({ data, error, errorTooltip }) => {
    if (error) {
        return (
            <span className="error" title={errorTooltip || error}>
        нет данных
      </span>
        );
    }
    const version = data?.[0]?.version || 'неизвестно';
    return <span className="value">{version}</span>;
};

export default DbVersion;