'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Avatar from '@/components/ui/Avatar';
import ThemeToggle from '@/components/ui/ThemeToggle';
import styles from './Navbar.module.css';

const LEVEL_NAMES = ['', 'Abertura', 'Diagnóstico', 'Objeções', 'Proposta', 'Fechamento'];

export default function Navbar() {
    const pathname = usePathname();
    const { user, profile, isAdmin, signOut } = useAuth();

    const navLinks = [
        { href: '/', label: 'Início', icon: '🏠' },
        { href: '/roleplay', label: 'Arena', icon: '🎯' },
        { href: '/objections', label: 'Objeções', icon: '💬' },
        { href: '/ranking', label: 'Ranking', icon: '🏆' },
    ];

    const adminLinks = [
        { href: '/admin', label: 'Admin', icon: '⚙️' },
    ];

    return (
        <nav className={styles.navbar}>
            <div className={styles.navbarInner}>
                <Link href="/" className={styles.logo}>
                    <div className={styles.logoIcon}>V</div>
                    <div className={styles.logoText}>
                        <span className={styles.logoTitle}>Voppi</span>
                        <span className={styles.logoSubtitle}>Arena de Roleplay</span>
                    </div>
                </Link>

                <div className={styles.navLinks}>
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}
                        >
                            <span>{link.icon}</span>
                            {link.label}
                        </Link>
                    ))}
                    {isAdmin && adminLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`${styles.navLink} ${pathname.startsWith(link.href) ? styles.active : ''}`}
                        >
                            <span>{link.icon}</span>
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div className={styles.navActions}>
                    <ThemeToggle />

                    {user ? (
                        <div className={styles.userMenu}>
                            <div className={styles.userInfo}>
                                <span className={styles.userName}>{profile?.full_name || 'Usuário'}</span>
                                <span className={styles.userLevel}>
                                    N{profile?.level || 1} • {LEVEL_NAMES[profile?.level || 1]}
                                </span>
                            </div>
                            <Avatar
                                name={profile?.full_name || 'U'}
                                src={profile?.avatar_url}
                                size="sm"
                            />
                        </div>
                    ) : (
                        <Link href="/login" className={styles.navLink}>
                            Entrar
                        </Link>
                    )}

                    <button className={styles.mobileMenuBtn}>
                        ☰
                    </button>
                </div>
            </div>
        </nav>
    );
}
