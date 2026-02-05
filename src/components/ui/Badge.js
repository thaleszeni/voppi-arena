'use client';

import styles from './Badge.module.css';

export default function Badge({
    children,
    variant = 'default',
    size = 'md',
    icon = null,
    className = '',
    ...props
}) {
    const classes = [
        styles.badge,
        styles[`badge--${variant}`],
        size !== 'md' && styles[`badge--${size}`],
        className,
    ].filter(Boolean).join(' ');

    return (
        <span className={classes} {...props}>
            {icon && <span>{icon}</span>}
            {children}
        </span>
    );
}
