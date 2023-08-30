import { resolve } from 'path'
import { defineConfig } from 'vite'


export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, './src/index.ts'),
      name: 'ObotAICompletionGenerator',
      fileName: "completion-generator",
      formats: ["es"]
    }
  },
  test: {
    environment: "jsdom"
  }
})
