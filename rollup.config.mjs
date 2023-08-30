import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'

const isProduction = process.env.BUILD === 'production'

export default {
  input: "./src/index.ts",
  output: {
    file: "./dist/completion-generator.es5.js",
    name: "ObotAICompletionGenerator",
    plugins: isProduction ? [
      /* Production */
      terser()
    ] : [
      /* Development */
    ]
  },
  plugins: [
    typescript({ tsconfig: "tsconfig.es5.json" })
  ]
}
