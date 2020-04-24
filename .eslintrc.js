// https://ts.xcatliu.com/engineering/lint
const rules = {
    // 禁止使用 var
    'no-var': 'error',
    // 优先使用 interface 而不是 type
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface']
};

module.exports = {
    extends: '@chatie',
    rules
};
