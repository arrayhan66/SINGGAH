import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Pola lama yang menyerap state dari prop di dalam effect (sengaja ada di codebase).
      // Diturunkan jadi warning agar tetap terlihat namun tidak menggagalkan CI.
      'react-hooks/set-state-in-effect': 'warn',
      // Kode memoization manual lama yang tidak dapat dipertahankan oleh compiler React baru.
      'react-hooks/preserve-manual-memoization': 'warn',
      // Context yang ikut mengekspor hook (pola standar) dianggap bukan ekspor komponen murni.
      'react-refresh/only-export-components': 'warn',
    },
  },
  // File Node / Playwright (e2e + konfigurasi) butuh global node (process, dsb).
  {
    files: ['e2e/**/*.js', 'playwright.config.js', 'eslint.config.js'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
])
