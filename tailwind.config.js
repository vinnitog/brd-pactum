/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brd: {
          DEFAULT: '#964AFB',
          50: '#F3EBFF',
          100: '#E4D2FF',
          200: '#C9A5FE',
          300: '#AE78FC',
          400: '#964AFB',
          500: '#7B26E8',
          600: '#601BB8',
          700: '#451488',
          800: '#2B0C58',
          900: '#150428'
        },
        black: '#0B0911',
        zinc: {
          800: '#241E33',
          900: '#181320',
          950: '#110E1A'
        },
        // Semáforo de urgência da agenda (alta/média/baixa).
        urg: {
          alta: '#EF4444',
          media: '#F5C518',
          baixa: '#22C55E'
        }
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}
