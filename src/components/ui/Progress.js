'use client';

import styles from './Progress.module.css';

export default function Progress({
    value = 0,
    max = 100,
    label = '',
    showValue = true,
    size = 'md',
    variant = 'default',
    animated = false,
    className = '',
    ...props
}) {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    const trackClasses = [
        styles.progressTrack,
        size !== 'md' && styles[`progressTrack--${size}`],
    ].filter(Boolean).join(' ');

    const barClasses = [
        styles.progressBar,
        variant !== 'default' && styles[`progressBar--${variant}`],
        animated && styles['progressBar--animated'],
    ].filter(Boolean).join(' ');

    return (
        <div className={`${styles.progressWrapper} ${className}`} {...props}>
            {(label || showValue) && (
                <div className={styles.progressLabel}>
                    {label && <span className={styles.progressLabelText}>{label}</span>}
                    {showValue && (
                        <span className={styles.progressLabelValue}>
                            {value}/{max}
                        </span>
                    )}
                </div>
            )}
            <div className={trackClasses}>
                <div
                    className={barClasses}
                    style={{ width: `${percentage}%` }}
                    role="progressbar"
                    aria-valuenow={value}
                    aria-valuemin={0}
                    aria-valuemax={max}
                />
            </div>
        </div>
    );
}
