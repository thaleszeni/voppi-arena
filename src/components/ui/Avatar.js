'use client';

import styles from './Avatar.module.css';

export default function Avatar({
    src,
    alt = '',
    name = '',
    size = 'md',
    className = '',
    ...props
}) {
    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.split(' ').filter(Boolean);
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    const classes = [
        styles.avatar,
        styles[`avatar--${size}`],
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={classes} {...props}>
            {src ? (
                <img src={src} alt={alt || name} />
            ) : (
                <span>{getInitials(name)}</span>
            )}
        </div>
    );
}
