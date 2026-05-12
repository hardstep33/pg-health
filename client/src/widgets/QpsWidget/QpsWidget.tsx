import React from 'react';
import { formatInteger } from '../../utils/formatNumber';

interface QpsWidgetProps {
    data: any;
    error: string;
    errorTooltip?: string;
}

const QpsWidget: React.FC<QpsWidgetProps> = ({ data, error, errorTooltip }) => {
    if (error) {
        return (
            <span className="error" title={errorTooltip || error}>
        нет данных
      </span>
        );
    }
    const qps = data?.[0]?.qps;
    return <span className="value">{qps !== undefined ? formatInteger(qps) : '—'}</span>;
};

export default QpsWidget;