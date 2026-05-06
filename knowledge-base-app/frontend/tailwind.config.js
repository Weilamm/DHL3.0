/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
      },
      colors: {
        dark: {
          900: '#0A0F1C', // Deep background
          800: '#111827', // Card background
          700: '#1F2937', // Hover state
        },
        primary: {
          500: '#8b5cf6', // Neon Purple
          600: '#7c3aed',
        },
        secondary: {
          500: '#06b6d4', // Cyan/Teal
          600: '#0891b2',
        }
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'glow-pulse': 'glowPulse 2s infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(139, 92, 246, 0.4)' },
          '50%': { boxShadow: '0 0 25px rgba(139, 92, 246, 0.8)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
