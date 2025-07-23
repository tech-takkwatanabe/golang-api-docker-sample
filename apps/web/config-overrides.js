const path = require('path');
const { override, addWebpackAlias } = require('customize-cra');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = override(
  // ESLint を CRA 内部から完全に排除する
  (config) => {
    // CRA内部の eslint-loader を削除（v5ではなくなってるが念のため）
    config.module.rules = config.module.rules.map((rule) => {
      if (Array.isArray(rule.oneOf)) {
        rule.oneOf = rule.oneOf.filter(
          (r) =>
            !r?.use?.some?.(
              (u) => typeof u.loader === 'string' && u.loader.includes('eslint-loader')
            )
        );
      }
      return rule;
    });

    config.plugins = config.plugins.filter(
      (plugin) => plugin.constructor.name !== 'ESLintWebpackPlugin'
    );

    // 自前の ESLintPlugin を追加
    config.plugins.push(
      new ESLintPlugin({
        overrideConfigFile: path.resolve(__dirname, 'eslint.config.mts'),
        extensions: ['js', 'jsx', 'ts', 'tsx'],
      })
    );

    return config;
  },
  addWebpackAlias({
    '@': path.resolve(__dirname, 'src'),
  })
);
