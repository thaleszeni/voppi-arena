'use client';

import styles from './Card.module.css';

export default function Card({
    children,
    variant = 'default',
    hoverable = false,
    className = '',
    ...props
}) {
    const classes = [
        styles.card,
        variant !== 'default' && styles[`card--${variant}`],
        hoverable && styles['card--hoverable'],
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={classes} {...props}>
            {children}
        </div>
    );
}

export function CardHeader({ children, className = '', ...props }) {
    return (
        <div className={`${styles.cardHeader} ${className}`} {...props}>
            {children}
        </div>
    );
}

export function CardTitle({ children, className = '', ...props }) {
    return (
        <h3 className={`${styles.cardTitle} ${className}`} {...props}>
            {children}
        </h3>
    );
}

export function CardDescription({ children, className = '', ...props }) {
    return (
        <p className={`${styles.cardDescription} ${className}`} {...props}>
            {children}
        </p>
    );
}

export function CardContent({ children, className = '', ...props }) {
    return (
        <div className={`${styles.cardContent} ${className}`} {...props}>
            {children}
        </div>
    );
}

export function CardFooter({ children, className = '', ...props }) {
    return (
        <div className={`${styles.cardFooter} ${className}`} {...props}>
            {children}
        </div>
    );
}
