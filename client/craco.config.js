module.exports = {
    webpack: {
        configure: (webpackConfig) => {
            // Игнорируем source-map-loader для sql-formatter
            const rules = webpackConfig.module.rules;
            for (const rule of rules) {
                if (rule.enforce === 'pre' && rule.use && rule.use.some(u => u.loader === 'source-map-loader')) {
                    rule.exclude = /node_modules\/sql-formatter/;
                }
            }
            return webpackConfig;
        },
    },
};