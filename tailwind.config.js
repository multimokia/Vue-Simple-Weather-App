import tailwindcssanimated from 'tailwindcss-animated';
import tailwindScrollbar from 'tailwind-scrollbar';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,vue}",
    ],
    theme: {
        extend: {
            animation: {
                marquee: 'marquee 25s linear infinite',
                marquee2: 'marquee2 25s linear infinite',
                "hover-slow": "hover 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            },
            keyframes: {
                marquee: {
                    '0%': { transform: 'translateX(0%)' },
                    '100%': { transform: 'translateX(-100%)' },
                },
                marquee2: {
                    '0%': { transform: 'translateX(100%)' },
                    '100%': { transform: 'translateX(0%)' },
                },
            },
            maxHeight: {
                '1/2': '50%',
                '1/3': '33.333333%',
                '3/4': '75%',
                '4/5': '80%',
                '9/10': '90%',
            },
            maxWidth: {
                '1/2': '50%',
                '1/3': '33.333333%',
                '3/4': '75%',
                '4/5': '80%',
                '9/10': '90%',
            },
        }
    },
    plugins: [
        tailwindcssanimated,
        tailwindScrollbar,
    ],
}
