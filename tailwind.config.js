module.exports = {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "startsnap-athens-gray": "var(--startsnapathens-gray)",
        "startsnap-black": "var(--startsnapblack)",
        "startsnap-blue-chalk": "var(--startsnapblue-chalk)",
        "startsnap-candlelight": "var(--startsnap-candlelight)",
        "startsnap-cerise": "var(--startsnap-cerise)",
        "startsnap-corn": "var(--startsnap-corn)",
        "startsnap-ebony-clay": "var(--startsnap-ebony-clay)",
        "startsnap-french-pass": "var(--startsnap-french-pass)",
        "startsnap-french-rose": "var(--startsnap-french-rose)",
        "startsnap-gray-chateau": "var(--startsnap-gray-chateau)",
        "startsnap-heliotrope": "var(--startsnap-heliotrope)",
        "startsnap-ice-cold": "var(--startsnap-ice-cold)",
        "startsnap-jewel": "var(--startsnap-jewel)",
        "startsnap-mischka": "var(--startsnap-mischka)",
        "startsnap-mountain-meadow": "var(--startsnap-mountain-meadow)",
        "startsnap-oxford-blue": "var(--startsnap-oxford-blue)",
        "startsnap-pale-sky": "var(--startsnap-pale-sky)",
        "startsnap-persian-blue": "var(--startsnap-persian-blue)",
        "startsnap-persian-blue-dark": "var(--startsnap-persian-blue-dark)",
        "startsnap-purple-heart": "var(--startsnap-purple-heart)",
        "startsnap-river-bed": "var(--startsnap-river-bed)",
        "startsnap-white": "var(--startsnap-white)",
        "startsnap-white-candlelight": "var(--startsnap-white-candlelight)",
        "startsnap-wisp-pink": "var(--startsnap-wisp-pink)",
        "startsnap-beige": "var(--startsnap-beige)",
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
        "startsnap-inter-regular":
          "var(--startsnap-inter-regular-font-family)",
        "startsnap-material-icons-regular":
          "var(--startsnap-material-icons-regular-font-family)",
        "startsnap-roboto-regular":
          "var(--startsnap-roboto-regular-font-family)",
        "startsnap-roboto-semibold":
          "var(--startsnap-roboto-semibold-font-family)",
        "startsnap-semantic-button":
          "var(--startsnap-semantic-button-font-family)",
        "startsnap-semantic-heading-1":
          "var(--startsnap-semantic-heading-1-font-family)",
        "startsnap-semantic-heading-2":
          "var(--startsnap-semantic-heading-2-font-family)",
        "startsnap-semantic-heading-3":
          "var(--startsnap-semantic-heading-3-font-family)",
        "startsnap-semantic-input":
          "var(--startsnap-semantic-input-font-family)",
        "startsnap-semantic-label":
          "var(--startsnap-semantic-label-font-family)",
        "startsnap-semantic-link":
          "var(--startsnap-semantic-link-font-family)",
        "startsnap-semantic-options":
          "var(--startsnap-semantic-options-font-family)",
        "startsnap-semantic-textarea":
          "var(--startsnap-semantic-textarea-font-family)",
        "startsnap-space-mono-regular":
          "var(--startsnap-space-mono-regular-font-family)",
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
  plugins: [require('@tailwindcss/typography')],
  darkMode: ["class"],
};