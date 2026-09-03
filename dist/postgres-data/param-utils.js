"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertParamValue = convertParamValue;
function convertParamValue(setting, unit) {
    if (setting === 'on')
        return 1;
    if (setting === 'off')
        return 0;
    const val = parseFloat(setting);
    if (isNaN(val))
        return 0;
    if (!unit || unit === '')
        return val;
    switch (unit) {
        case '8kB': return val * 8 * 1024;
        case 'kB': return val * 1024;
        case 'MB': return val * 1024 * 1024;
        case 'GB': return val * 1024 * 1024 * 1024;
        case 'ms': return val;
        case 's': return val * 1000;
        case 'min': return val * 60 * 1000;
        default: return val;
    }
}
//# sourceMappingURL=param-utils.js.map