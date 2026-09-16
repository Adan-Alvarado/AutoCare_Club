# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

React Compiler nativo está habilitado mediante `@vitejs/plugin-react` y `oxc-transform-react`, el puerto Rust/Oxc. Esta integración se considera experimental por el plugin oficial; `logDiagnostics` deja visibles diagnósticos recuperables durante desarrollo. El lint informa de patrones que el compilador debe omitir. Ver [documentación del plugin](https://www.npmjs.com/package/@vitejs/plugin-react) y la [guía oficial de React](https://react.dev/learn/react-compiler/installation).

## Mejora visual

La base visual está aplicada de forma incremental. La interfaz comparte botones, campos, alertas, paneles, bordes y tipografía. Los componentes viven en `src/components/ui` y mantienen una API de variantes sencilla para que las pantallas se migren sin cambios bruscos.

El inicio de sesión y el registro son los primeros flujos migrados. Las pantallas restantes siguen usando los adaptadores existentes de botones y paneles, por lo que reciben la misma apariencia mientras se actualizan de forma gradual.

La configuración en `components.json`, los alias `@/` y el CLI de shadcn permiten añadir componentes de forma controlada. Ya se incorporaron Select, Badge, Skeleton, Sheet y AlertDialog; Sheet y Skeleton quedan disponibles para la primera pantalla que los necesite. La revisión completa de escritorio, teclado y contraste sigue pendiente.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
