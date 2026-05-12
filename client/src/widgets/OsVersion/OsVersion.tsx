import React from 'react';

interface OsVersionProps {
    data: any;
    error: string;
    errorTooltip?: string;
}

const OsVersion: React.FC<OsVersionProps> = ({ data, error, errorTooltip }) => {
    if (error) {
        return (
            <span className="error" title={errorTooltip || error}>
        нет данных
      </span>
        );
    }
    const os = data?.[0]?.os_version || 'нет данных';
    return <span className="value">{os}</span>;
};

export default OsVersion;