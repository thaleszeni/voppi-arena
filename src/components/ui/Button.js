'use client';

import styles from './Button.module.css';

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    disabled = false,
    icon = null,
    iconPosition = 'left',
    className = '',
    as = 'button',
    href,
    ...props
}) {
    const classes = [
        styles.button,
        styles[`button--${variant}`],
        size !== 'md' && styles[`button--${size}`],
        fullWidth && styles['button--full'],
        loading && styles['button--loading'],
        icon && !children && styles['button--icon'],
        className,
    ].filter(Boolean).join(' ');

    const content = (
        <>
            {icon && iconPosition === 'left' && <span className={styles.icon}>{icon}</span>}
            {children}
            {icon && iconPosition === 'right' && <span className={styles.icon}>{icon}</span>}
        </>
    );

    if (as === 'a' || href) {
        return (
            <a href={href} className={classes} {...props}>
                {content}
            </a>
        );
    }

    return (
        <button
            className={classes}
            disabled={disabled || loading}
            {...props}
        >
            {content}
        </button>
    );
}
