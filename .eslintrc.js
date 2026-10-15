module.exports = {
  root: true,
  env: { browser: true, node: true, es2022: true },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    '@vue/eslint-config-prettier', // 必须放最后，关掉和 Prettier 冲突的规则
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'vue/multi-word-component-names': 'off', // BlogList 这类单词名放行
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],
  },
};
