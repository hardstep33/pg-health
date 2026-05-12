import React from 'react';
import { formatDecimal } from '../../../utils/formatNumber';

interface ParamsDbSizeProps {
    dbSizeGb: number | null;
    error?: string;
    errorTooltip?: string;
}

const ParamsDbSize: React.FC<ParamsDbSizeProps> = ({ dbSizeGb }) => {
    if (dbSizeGb === null) return <span className="error">нет данных</span>;
    return <span className="value">{formatDecimal(dbSizeGb, 2)} GB</span>;
};

export default ParamsDbSize;