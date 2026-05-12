import React from 'react';
import { formatInteger } from '../../../utils/formatNumber';

interface ParamsCpuSizeProps {
    cpuCores: number | null;
    error?: string;
    errorTooltip?: string;
}

const ParamsCpuSize: React.FC<ParamsCpuSizeProps> = ({ cpuCores, error, errorTooltip }) => {
    if (error || cpuCores === null) {
        return (
            <span className="error" title={errorTooltip || error || 'нет данных'}>
        нет данных
      </span>
        );
    }
    return <span className="value">{formatInteger(cpuCores)} ядер</span>;
};

export default ParamsCpuSize;