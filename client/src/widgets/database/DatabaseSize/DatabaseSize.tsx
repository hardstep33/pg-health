import React from 'react';
import { formatDecimal } from '../../../utils/formatNumber';

interface DatabaseSizeProps {
    data: any;
    error: string;
    errorTooltip?: string;
}

const DatabaseSize: React.FC<DatabaseSizeProps> = ({ data, error, errorTooltip }) => {
    if (error) {
        return (
            <span className="error" title={errorTooltip || error}>
        нет данных
      </span>
        );
    }
    const size = data?.[0]?.db_size_gb;
    return <span className="value">{size !== undefined ? `${formatDecimal(size, 2)} GB` : 'неизвестно'}</span>;
};

export default DatabaseSize;