import { unlinkSync, existsSync } from 'fs'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'


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
  },
  plugins: [
    dts({
      rollupTypes: true,
      beforeWriteFile(_, __) {
        const dtsPath = resolve(__dirname, "./dist/completion-generator.d.ts")
        const dtsExists = existsSync(dtsPath)
        if (dtsExists) {
          unlinkSync(dtsPath)
        }
      }
    })
  ]
})
