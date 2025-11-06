import { nextui } from '@nextui-org/react'

export const lightTheme = nextui({
    themes: {
        light: {
            colors: {
                background: '#FFFFFF',
                foreground: '#11181C',
                primary: {
                    100: '#E6F0FF',
                    200: '#CCE0FF',
                    300: '#99C1FF',
                    400: '#66A3FF',
                    500: '#3384FF',
                    600: '#0066FF',
                    700: '#0052CC',
                    800: '#003D99',
                    900: '#002966',
                    DEFAULT: '#0066FF',
                },
                secondary: {
                    100: '#F0F7FF',
                    200: '#E1EFFF',
                    300: '#C3DFFF',
                    400: '#A5CFFF',
                    500: '#87BFFF',
                    600: '#69AFFF',
                    700: '#4B9FFF',
                    800: '#2D8FFF',
                    900: '#0F7FFF',
                    DEFAULT: '#69AFFF',
                },
            },
        },
        dark: {
            colors: {
                background: '#000000',
                foreground: '#ECEDEE',
                primary: {
                    100: '#002966',
                    200: '#003D99',
                    300: '#0052CC',
                    400: '#0066FF',
                    500: '#3384FF',
                    600: '#66A3FF',
                    700: '#99C1FF',
                    800: '#CCE0FF',
                    900: '#E6F0FF',
                    DEFAULT: '#3384FF',
                },
                secondary: {
                    100: '#0F7FFF',
                    200: '#2D8FFF',
                    300: '#4B9FFF',
                    400: '#69AFFF',
                    500: '#87BFFF',
                    600: '#A5CFFF',
                    700: '#C3DFFF',
                    800: '#E1EFFF',
                    900: '#F0F7FF',
                    DEFAULT: '#87BFFF',
                },
            },
        },
    },
})
