import React, { createContext, useContext, useEffect, useState } from 'react'
import { NextUIProvider } from "@nextui-org/react"
import { useTheme as useNextTheme } from 'next-themes'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

const ThemeContext = createContext(undefined)

export const ThemeProvider = ({ children }) => {
    const [mounted, setMounted] = useState(false)
    const { theme, setTheme } = useNextTheme()

    useEffect(() => {
        setMounted(true)
    }, [])

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light')
    }

    if (!mounted) return null

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <NextUIProvider>
                {children}
            </NextUIProvider>
        </ThemeContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}

export const RootThemeProvider = ({ children }) => {
    return (
        <NextThemesProvider attribute="class" defaultTheme="light">
            <ThemeProvider>{children}</ThemeProvider>
        </NextThemesProvider>
    )
}
