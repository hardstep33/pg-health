import React from 'react';
import { formatDecimal } from '../../utils/formatNumber';

interface RamSizeProps {
    data: any;
    error: string;
    errorTooltip?: string;
}

const RamSize: React.FC<RamSizeProps> = ({ data, error, errorTooltip }) => {
    if (error) {
        return (
            <span className="error" title={errorTooltip || error}>
        нет данных
      </span>
        );
    }
    const gb = data?.[0]?.total_ram_gb;
    return <span className="value">{gb !== undefined ? `${formatDecimal(gb, 1)} GB` : 'нет данных'}</span>;
};

export default RamSize;