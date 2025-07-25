// tailwind.config.js
const plugin = require('tailwindcss/plugin'); // Keep this if you use custom plugins

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}', // Make sure this is included for your general source files
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
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
        // --- Custom Cyber Theme Colors ---
        'cyber-primary': '#00f5ff',   // Cyan
        'cyber-secondary': '#00ff88', // Green
        'cyber-accent': '#ffcc00',    // Yellow/Orange
        'cyber-surface': '#1a2b3c',   // Dark blue-grey for card backgrounds
        'cyber-border': '#335577',    // Slightly lighter blue-grey for borders
        'cyber-dark': '#071019',      // Very dark background
        // --- End Custom Cyber Theme Colors ---
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
      // --- Custom Cyber Theme Extensions ---
      backgroundImage: {
        'cyber-gradient': 'linear-gradient(135deg, #071019 0%, #1a2b3c 50%, #071019 100%)',
      },
      boxShadow: {
        'cyber-glow': '0 0 10px rgba(0, 245, 255, 0.6), 0 0 20px rgba(0, 245, 255, 0.4)', // Primary color glow
      },
      // IMPORTANT: Add textShadow ONLY if you have 'tailwindcss-textshadow' plugin installed and configured
      /*
      textShadow: {
        'cyber-text-glow': '0 0 8px rgba(0, 245, 255, 0.8), 0 0 15px rgba(0, 245, 255, 0.6)',
      },
      */
      // --- End Custom Cyber Theme Extensions ---
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // Add 'tailwindcss-textshadow' here if you install it for cyber-text-glow
    // require("tailwindcss-textshadow"),
  ],
};