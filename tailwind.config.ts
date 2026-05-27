import type { Config } from "tailwindcss";

// Paleta "jovem descolado" — dark mode com acento neon verde-limão.
// Mantemos os mesmos nomes de tokens (ink/gold/cream/wood) que o resto do app
// já usa — apenas os valores hex foram redefinidos:
//   ink-*   → tons de fundo escuro (preto suave → cinza azulado)
//   gold-*  → verde-limão neon (acento principal)
//   cream-* → branco off-white para textos
//   wood-*  → roxo elétrico como acento secundário
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#0b0b0e", // fundo da página
          800: "#15151a", // cards
          700: "#1f1f25", // cards elevados / inputs
          600: "#2d2d35", // bordas sutis
        },
        wood: {
          900: "#4c1d95", // roxo profundo
          800: "#6d28d9",
          700: "#8b5cf6",
          600: "#a78bfa",
        },
        gold: {
          400: "#d4ff5c", // neon claro
          500: "#c6ff3d", // verde-limão — acento principal
          600: "#a3d829", // verde maduro — bordas
          700: "#7c9e1f", // verde escuro
        },
        cream: {
          100: "#fafafa", // texto principal (off-white)
          200: "#e4e4e7", // texto corpo
          300: "#a1a1aa", // texto suave
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "'Space Grotesk'", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "'Inter'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        gold: "0 0 0 1px rgba(198,255,61,0.4), 0 10px 30px -10px rgba(198,255,61,0.35)",
      },
    },
  },
  plugins: [],
} satisfies Config;
