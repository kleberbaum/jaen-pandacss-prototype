import { defineConfig } from '@pandacss/dev'
import { createPreset } from '@park-ui/panda-preset'

export default defineConfig({
  preflight: true,
  presets: [
    '@pandacss/preset-base',
    createPreset({
      accentColor: 'amber',
      grayColor: 'sand',
      borderRadius: 'xl',
    }),
  ],
  include: ["./src/pages/**/*.{js,jsx,ts,tsx}", "./src/components/**/*.{js,jsx,ts,tsx}"],
  exclude: [],
  theme: {
    extend: {
      tokens: {
        colors: {
          amber: {
            light: {
              1: { value: '#fefcfb' },
              2: { value: '#fff6ee' },
              3: { value: '#ffedde' },
              4: { value: '#ffddc4' },
              5: { value: '#ffd0ac' },
              6: { value: '#ffc090' },
              7: { value: '#faad7a' },
              8: { value: '#ed9557' },
              9: { value: '#f77f00' },
              10: { value: '#e97400' },
              11: { value: '#b76200' },
              12: { value: '#543118' },
            },
            dark: {
              1: { value: '#0e0906' },
              2: { value: '#1d140f' },
              3: { value: '#321d0e' },
              4: { value: '#462000' },
              5: { value: '#542904' },
              6: { value: '#643714' },
              7: { value: '#7b4722' },
              8: { value: '#9e5c2b' },
              9: { value: '#f77f00' },
              10: { value: '#e97400' },
              11: { value: '#ffa158' },
              12: { value: '#ffdec9' },
            },
          },
        },
      },
    },
  },
  jsxFramework: 'react',
  outdir: 'styled-system',
})
