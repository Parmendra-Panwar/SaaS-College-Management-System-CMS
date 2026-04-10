import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react({
      // React Compiler support in SWC
      jsxImportSource: 'react',
      babel: {
        plugins: [
          ['babel-plugin-react-compiler', { /* options */ }],
        ],
      },
    })
  ],
})