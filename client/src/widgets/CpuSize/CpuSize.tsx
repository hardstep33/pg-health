import React from 'react';
import { formatInteger } from '../../utils/formatNumber';

interface CpuSizeProps {
    data: any;
    error: string;
    errorTooltip?: string;
}

const CpuSize: React.FC<CpuSizeProps> = ({ data, error, errorTooltip }) => {
    if (error) {
        return (
            <span className="error" title={errorTooltip || error}>
        нет данных
      </span>
        );
    }
    const cores = data?.[0]?.cpu_cores;
    return <span className="value">{cores !== undefined ? `${formatInteger(cores)} ядер` : 'нет данных'}</span>;
};

export default CpuSize;