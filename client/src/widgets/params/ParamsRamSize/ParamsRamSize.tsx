import React from 'react';
import { formatDecimal } from '../../../utils/formatNumber';

interface ParamsRamSizeProps {
    totalRamGb: number | null;
    error?: string;
    errorTooltip?: string;
}

const ParamsRamSize: React.FC<ParamsRamSizeProps> = ({ totalRamGb, error, errorTooltip }) => {
    if (error || totalRamGb === null) {
        return (
            <span className="error" title={errorTooltip || error || 'нет данных'}>
        нет данных
      </span>
        );
    }
    return <span className="value">{formatDecimal(totalRamGb, 1)} GB</span>;
};

export default ParamsRamSize;