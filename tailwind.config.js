module.exports = {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "koniakowcomathens-gray": "var(--koniakowcomathens-gray)",
        koniakowcomblack: "var(--koniakowcomblack)",
        "koniakowcomblue-chalk": "var(--koniakowcomblue-chalk)",
        koniakowcomcandlelight: "var(--koniakowcomcandlelight)",
        koniakowcomcerise: "var(--koniakowcomcerise)",
        koniakowcomcorn: "var(--koniakowcomcorn)",
        "koniakowcomebony-clay": "var(--koniakowcomebony-clay)",
        "koniakowcomfrench-pass": "var(--koniakowcomfrench-pass)",
        "koniakowcomfrench-rose": "var(--koniakowcomfrench-rose)",
        "koniakowcomgray-chateau": "var(--koniakowcomgray-chateau)",
        koniakowcomheliotrope: "var(--koniakowcomheliotrope)",
        "koniakowcomice-cold": "var(--koniakowcomice-cold)",
        koniakowcomjewel: "var(--koniakowcomjewel)",
        koniakowcommischka: "var(--koniakowcommischka)",
        "koniakowcommountain-meadow": "var(--koniakowcommountain-meadow)",
        "koniakowcomoxford-blue": "var(--koniakowcomoxford-blue)",
        "koniakowcompale-sky": "var(--koniakowcompale-sky)",
        "koniakowcompersian-blue": "var(--koniakowcompersian-blue)",
        "koniakowcompurple-heart": "var(--koniakowcompurple-heart)",
        "koniakowcomriver-bed": "var(--koniakowcomriver-bed)",
        koniakowcomwhite: "var(--koniakowcomwhite)",
        "koniakowcomwhite-candlelight": "var(--koniakowcomwhite-candlelight)",
        "koniakowcomwisp-pink": "var(--koniakowcomwisp-pink)",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        "koniakow-com-inter-regular":
          "var(--koniakow-com-inter-regular-font-family)",
        "koniakow-com-material-icons-regular":
          "var(--koniakow-com-material-icons-regular-font-family)",
        "koniakow-com-roboto-regular":
          "var(--koniakow-com-roboto-regular-font-family)",
        "koniakow-com-roboto-semibold":
          "var(--koniakow-com-roboto-semibold-font-family)",
        "koniakow-com-semantic-button":
          "var(--koniakow-com-semantic-button-font-family)",
        "koniakow-com-semantic-heading-1":
          "var(--koniakow-com-semantic-heading-1-font-family)",
        "koniakow-com-semantic-heading-2":
          "var(--koniakow-com-semantic-heading-2-font-family)",
        "koniakow-com-semantic-heading-3":
          "var(--koniakow-com-semantic-heading-3-font-family)",
        "koniakow-com-semantic-input":
          "var(--koniakow-com-semantic-input-font-family)",
        "koniakow-com-semantic-label":
          "var(--koniakow-com-semantic-label-font-family)",
        "koniakow-com-semantic-link":
          "var(--koniakow-com-semantic-link-font-family)",
        "koniakow-com-semantic-options":
          "var(--koniakow-com-semantic-options-font-family)",
        "koniakow-com-semantic-textarea":
          "var(--koniakow-com-semantic-textarea-font-family)",
        "koniakow-com-space-mono-regular":
          "var(--koniakow-com-space-mono-regular-font-family)",
        sans: [
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
  },
  plugins: [],
  darkMode: ["class"],
};
