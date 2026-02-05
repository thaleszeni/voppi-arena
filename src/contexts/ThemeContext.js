'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({});

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('dark'); // Default to dark mode as per requirements
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Load saved theme from localStorage
        const savedTheme = localStorage.getItem('voppi-theme');
        if (savedTheme) {
            setTheme(savedTheme);
        }
    }, []);

    useEffect(() => {
        if (mounted) {
            // Apply theme to document
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('voppi-theme', theme);
        }
    }, [theme, mounted]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const value = {
        theme,
        setTheme,
        toggleTheme,
        isDark: theme === 'dark',
    };

    // Prevent flash of wrong theme
    if (!mounted) {
        return null;
    }

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
