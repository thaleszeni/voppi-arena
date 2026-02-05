'use client';

import { useTheme } from '@/contexts/ThemeContext';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle({ className = '' }) {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`${styles.toggle} ${className}`}
            aria-label={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
            title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
        >
            <span className={`${styles.icon} ${theme === 'dark' ? styles.active : ''}`}>
                🌙
            </span>
            <span className={`${styles.icon} ${theme === 'light' ? styles.active : ''}`}>
                ☀️
            </span>
            <span
                className={styles.slider}
                style={{ transform: theme === 'dark' ? 'translateX(0)' : 'translateX(28px)' }}
            />
        </button>
    );
}
