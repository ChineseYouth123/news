// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'prettier', // 👈 放在最后，覆盖冲突规则
  ],
};
