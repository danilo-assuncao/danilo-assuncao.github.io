const path = require('path');

module.exports = function override(config, env) {
  // Remove the default file-loader rule for md files
  config.module.rules = config.module.rules.map(rule => {
    if (rule.oneOf) {
      rule.oneOf = rule.oneOf.map(oneOf => {
        if (oneOf.type === 'asset/resource') {
          oneOf.exclude = [...(oneOf.exclude || []), /\.md$/];
        }
        return oneOf;
      });
    }
    return rule;
  });

  // Add our custom loader for md files
  config.module.rules.push({
    test: /\.md$/,
    use: [
      {
        loader: 'raw-loader',
        options: {
          esModule: false
        }
      }
    ]
  });

  return config;
};
