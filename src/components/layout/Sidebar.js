'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Avatar from '@/components/ui/Avatar';
import Progress from '@/components/ui/Progress';
import styles from './Sidebar.module.css';

const LEVEL_NAMES = ['', 'Abertura', 'Diagnóstico', 'Objeções', 'Proposta', 'Fechamento'];

export default function Sidebar({ isOpen = true }) {
    const pathname = usePathname();
    const { profile, isAdmin } = useAuth();

    const mainLinks = [
        { href: '/', label: 'Dashboard', icon: '📊' },
        { href: '/roleplay', label: 'Arena', icon: '🎯', badge: 'Novo' },
        { href: '/objections', label: 'Biblioteca de Objeções', icon: '💬' },
        { href: '/ranking', label: 'Ranking', icon: '🏆' },
        { href: '/profile', label: 'Meu Perfil', icon: '👤' },
    ];

    const adminLinks = [
        { href: '/admin', label: 'Dashboard Admin', icon: '📈' },
        { href: '/admin/scenarios', label: 'Cenários', icon: '🎬' },
        { href: '/admin/objections', label: 'Gerenciar Objeções', icon: '💬' },
        { href: '/admin/users', label: 'Usuários', icon: '👥' },
        { href: '/admin/challenges', label: 'Desafios', icon: '🎯' },
        { href: '/admin-manual', label: 'Manual do Admin', icon: '📖' },
    ];

    const xpForNextLevel = (profile?.level || 1) * 500;
    const currentXp = profile?.total_points || 0;
    const xpProgress = Math.min(100, (currentXp % xpForNextLevel) / xpForNextLevel * 100);

    return (
        <aside className={`${styles.sidebar} ${!isOpen ? styles.collapsed : ''}`}>
            {/* User Stats Card */}
            {profile && (
                <div className={styles.userStats}>
                    <div className={styles.userStatsHeader}>
                        <Avatar
                            name={profile.full_name}
                            src={profile.avatar_url}
                            size="lg"
                        />
                        <div className={styles.userStatsInfo}>
                            <div className={styles.userStatsName}>{profile.full_name}</div>
                            <div className={styles.userStatsLevel}>
                                N{profile.level} • {LEVEL_NAMES[profile.level] || 'Mestre'}
                            </div>
                        </div>
                    </div>

                    <Progress
                        value={currentXp % xpForNextLevel}
                        max={xpForNextLevel}
                        label="XP para próximo nível"
                        size="sm"
                    />

                    <div className={styles.userStatsGrid}>
                        <div className={styles.userStatItem}>
                            <div className={styles.userStatValue}>{profile.total_points}</div>
                            <div className={styles.userStatLabel}>Pontos</div>
                        </div>
                        <div className={styles.userStatItem}>
                            <div className={styles.userStatValue}>#{profile.rank || '-'}</div>
                            <div className={styles.userStatLabel}>Ranking</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Navigation */}
            <div className={styles.sidebarSection}>
                <div className={styles.sidebarTitle}>Menu</div>
                <nav className={styles.sidebarNav}>
                    {mainLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`${styles.sidebarLink} ${pathname === link.href ? styles.active : ''}`}
                        >
                            <span className={styles.sidebarLinkIcon}>{link.icon}</span>
                            {link.label}
                            {link.badge && (
                                <span className={styles.sidebarLinkBadge}>{link.badge}</span>
                            )}
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Admin Navigation */}
            {isAdmin && (
                <div className={styles.sidebarSection}>
                    <div className={styles.sidebarTitle}>Administração</div>
                    <nav className={styles.sidebarNav}>
                        {adminLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`${styles.sidebarLink} ${pathname === link.href ? styles.active : ''}`}
                            >
                                <span className={styles.sidebarLinkIcon}>{link.icon}</span>
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}
        </aside>
    );
}
