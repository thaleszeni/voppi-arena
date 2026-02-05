'use client';

import styles from './Input.module.css';

export default function Input({
    label,
    type = 'text',
    error,
    helpText,
    required = false,
    icon = null,
    className = '',
    ...props
}) {
    return (
        <div className={`${styles.inputWrapper} ${className}`}>
            {label && (
                <label className={styles.label}>
                    {label}
                    {required && <span className={styles.required}>*</span>}
                </label>
            )}
            <div className={styles.inputContainer}>
                {icon && <span className={styles.inputIcon}>{icon}</span>}
                <input
                    type={type}
                    className={`${styles.input} ${icon ? styles['input--withIcon'] : ''} ${error ? styles['input--error'] : ''}`}
                    {...props}
                />
            </div>
            {helpText && !error && <span className={styles.helpText}>{helpText}</span>}
            {error && <span className={styles.errorText}>{error}</span>}
        </div>
    );
}

export function Textarea({
    label,
    error,
    helpText,
    required = false,
    className = '',
    ...props
}) {
    return (
        <div className={`${styles.inputWrapper} ${className}`}>
            {label && (
                <label className={styles.label}>
                    {label}
                    {required && <span className={styles.required}>*</span>}
                </label>
            )}
            <textarea
                className={`${styles.input} ${styles.textarea} ${error ? styles['input--error'] : ''}`}
                {...props}
            />
            {helpText && !error && <span className={styles.helpText}>{helpText}</span>}
            {error && <span className={styles.errorText}>{error}</span>}
        </div>
    );
}

export function Select({
    label,
    options = [],
    error,
    helpText,
    required = false,
    placeholder = 'Selecione...',
    className = '',
    ...props
}) {
    return (
        <div className={`${styles.inputWrapper} ${className}`}>
            {label && (
                <label className={styles.label}>
                    {label}
                    {required && <span className={styles.required}>*</span>}
                </label>
            )}
            <select
                className={`${styles.input} ${styles.select} ${error ? styles['input--error'] : ''}`}
                {...props}
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {helpText && !error && <span className={styles.helpText}>{helpText}</span>}
            {error && <span className={styles.errorText}>{error}</span>}
        </div>
    );
}
