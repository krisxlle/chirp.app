import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar-background)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
        // Metro-specific colors to match React Native StyleSheet
        metro: {
          background: "#fafafa",
          white: "#ffffff",
          card: "#ffffff",
          border: "#e5e7eb",
          "border-light": "#e1e8ed",
          "border-muted": "#f0f0f0",
          text: "#1a1a1a",
          "text-muted": "#657786",
          "text-secondary": "#374151",
          purple: "#7c3aed",
          "purple-light": "#f8f4ff",
          "purple-gradient-start": "#C671FF",
          "purple-gradient-end": "#FF61A6",
          "purple-accent": "#f5a5e0",
          gray: {
            50: "#f7f9fa",
            100: "#f0f0f0",
            200: "#e5e7eb",
            300: "#d1d5db",
            400: "#9ca3af",
            500: "#6b7280",
            600: "#4b5563",
            700: "#374151",
            800: "#1f2937",
            900: "#111827",
          },
          shadow: {
            light: "0 2px 8px rgba(124, 58, 237, 0.08)",
            medium: "0 4px 12px rgba(217, 70, 239, 0.15)",
            strong: "0 4px 12px rgba(245, 158, 11, 0.25)",
          },
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      // Metro-specific spacing and sizing to match React Native StyleSheet
      spacing: {
        'metro-xs': '2px',
        'metro-sm': '4px',
        'metro-md': '8px',
        'metro-lg': '12px',
        'metro-xl': '16px',
        'metro-2xl': '20px',
        'metro-3xl': '24px',
        'metro-4xl': '32px',
        'metro-5xl': '40px',
        'metro-6xl': '48px',
        'metro-7xl': '56px',
        'metro-8xl': '64px',
      },
      fontSize: {
        'metro-xs': ['12px', { lineHeight: '16px', fontWeight: '600' }],
        'metro-sm': ['14px', { lineHeight: '20px', fontWeight: '500' }],
        'metro-base': ['16px', { lineHeight: '24px' }],
        'metro-lg': ['18px', { lineHeight: '28px', fontWeight: '600' }],
        'metro-xl': ['20px', { lineHeight: '28px', fontWeight: '700' }],
        'metro-2xl': ['24px', { lineHeight: '32px', fontWeight: 'bold' }],
      },
      boxShadow: {
        'metro-light': '0 2px 8px rgba(124, 58, 237, 0.08)',
        'metro-medium': '0 4px 12px rgba(217, 70, 239, 0.15)',
        'metro-strong': '0 4px 12px rgba(245, 158, 11, 0.25)',
        'metro-card': '0 2px 8px rgba(0, 0, 0, 0.05)',
        'metro-button': '0 2px 6px rgba(124, 58, 237, 0.3)',
      },
      maxWidth: {
        'metro-card': '600px',
        'metro-content': '600px',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"), 
    require("@tailwindcss/typography"),
    // Add custom Metro utility classes
    function({ addUtilities }) {
      const metroUtilities = {
        '.metro-card': {
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(124, 58, 237, 0.08)',
          maxWidth: '600px',
          margin: '0 auto',
        },
        '.metro-header': {
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          padding: '12px 16px',
        },
        '.metro-tabs-container': {
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e1e8ed',
          padding: '12px 0',
        },
        '.metro-tabs-button-container': {
          display: 'flex',
          backgroundColor: '#f7f9fa',
          borderRadius: '12px',
          padding: '3px',
        },
        '.metro-tab-button': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px 12px',
          borderRadius: '8px',
          flex: '1',
          fontSize: '12px',
          fontWeight: '600',
          color: '#657786',
        },
        '.metro-tab-button-active': {
          backgroundColor: '#7c3aed',
          color: '#ffffff',
          boxShadow: '0 2px 6px rgba(124, 58, 237, 0.3)',
        },
        '.metro-feed-container': {
          backgroundColor: '#fafafa',
          minHeight: '100vh',
        },
        '.metro-chirp-card': {
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '16px',
          margin: '3px 0',
          boxShadow: '0 2px 8px rgba(124, 58, 237, 0.08)',
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto',
        },
        '.metro-button-primary': {
          backgroundColor: '#7c3aed',
          color: '#ffffff',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '16px',
          fontWeight: '600',
          boxShadow: '0 2px 6px rgba(124, 58, 237, 0.3)',
          border: 'none',
          cursor: 'pointer',
        },
        '.metro-button-secondary': {
          backgroundColor: '#f7f9fa',
          color: '#657786',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '16px',
          fontWeight: '600',
          border: 'none',
          cursor: 'pointer',
        },
      };
      addUtilities(metroUtilities);
    }
  ],
} satisfies Config;
