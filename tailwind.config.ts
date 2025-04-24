import type { Config } from "tailwindcss"
import { colors, typography, spacing, borderRadius, shadows } from "./src/lib/design-system"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors,
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize,
      fontWeight: typography.fontWeight,
      lineHeight: typography.lineHeight,
      spacing,
      borderRadius,
      boxShadow: shadows,
      animation: {
        bounce: 'bounce 1.4s infinite',
      },
      keyframes: {
        bounce: {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-4px)',
          },
        },
      },
      transitionDelay: {
        '0': '0ms',
        '150': '150ms',
        '300': '300ms',
      },
    },
  },
  plugins: [],
}
export default config 