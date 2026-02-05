'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Progress from '@/components/ui/Progress';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import styles from './page.module.css';

const LEVEL_NAMES = ['', 'Abertura', 'Diagnóstico', 'Objeções', 'Proposta', 'Fechamento'];

const MOCK_BADGES = [
    { id: 1, name: 'Primeiro Roleplay', icon: '🎯', description: 'Completou seu primeiro roleplay' },
    { id: 2, name: 'Abertura Forte', icon: '💪', description: 'Nota máxima em abertura' },
    { id: 3, name: 'Diagnóstico Ninja', icon: '🥷', description: 'Identificou 10 dores do cliente' },
];

const MOCK_HISTORY = [
    { id: 1, scenario: 'Restaurante Grande - Decisor', score: 850, date: '2026-02-04', status: 'completed' },
    { id: 2, scenario: 'Restaurante - Gatekeeper', score: 720, date: '2026-02-03', status: 'completed' },
    { id: 3, scenario: 'Parque / Atração Turística', score: 680, date: '2026-02-02', status: 'completed' },
];

export default function ProfilePage() {
    const { user, profile, loading, signOut } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loader}></div>
                <p>Carregando...</p>
            </div>
        );
    }

    const xpForNextLevel = (profile?.level || 1) * 500;
    const currentXp = profile?.total_points || 0;

    const handleSignOut = async () => {
        await signOut();
        router.push('/login');
    };

    return (
        <>
            <Navbar />
            <div className={styles.pageWrapper}>
                <Sidebar />
                <main className={styles.mainContent}>
                    {/* Profile Header */}
                    <div className={styles.profileHeader}>
                        <div className={styles.profileAvatar}>
                            <Avatar
                                name={profile?.full_name || 'Usuário'}
                                src={profile?.avatar_url}
                                size="2xl"
                            />
                            <button className={styles.avatarEdit}>✏️</button>
                        </div>
                        <div className={styles.profileInfo}>
                            <h1 className={styles.profileName}>{profile?.full_name || 'Usuário'}</h1>
                            <div className={styles.profileMeta}>
                                <Badge variant="primary">
                                    N{profile?.level || 1} • {LEVEL_NAMES[profile?.level || 1]}
                                </Badge>
                                {profile?.role === 'admin' && (
                                    <Badge variant="secondary">Admin</Badge>
                                )}
                            </div>
                            <p className={styles.profileEmail}>{user?.email}</p>
                        </div>
                        <div className={styles.profileActions}>
                            <Button variant="ghost" onClick={handleSignOut}>
                                Sair
                            </Button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className={styles.statsGrid}>
                        <Card>
                            <CardContent>
                                <div className={styles.statCard}>
                                    <span className={styles.statIcon}>🎯</span>
                                    <div>
                                        <span className={styles.statValue}>{profile?.total_points || 0}</span>
                                        <span className={styles.statLabel}>Pontos Totais</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent>
                                <div className={styles.statCard}>
                                    <span className={styles.statIcon}>🏆</span>
                                    <div>
                                        <span className={styles.statValue}>#5</span>
                                        <span className={styles.statLabel}>Posição Ranking</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent>
                                <div className={styles.statCard}>
                                    <span className={styles.statIcon}>🎬</span>
                                    <div>
                                        <span className={styles.statValue}>{MOCK_HISTORY.length}</span>
                                        <span className={styles.statLabel}>Roleplays Feitos</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent>
                                <div className={styles.statCard}>
                                    <span className={styles.statIcon}>🏅</span>
                                    <div>
                                        <span className={styles.statValue}>{MOCK_BADGES.length}</span>
                                        <span className={styles.statLabel}>Badges</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Level Progress */}
                    <Card className={styles.levelCard}>
                        <CardHeader>
                            <CardTitle>Progresso de Nível</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={styles.levelProgress}>
                                <div className={styles.levelInfo}>
                                    <span className={styles.currentLevel}>
                                        N{profile?.level || 1} • {LEVEL_NAMES[profile?.level || 1]}
                                    </span>
                                    <span className={styles.nextLevel}>
                                        N{(profile?.level || 1) + 1} • {LEVEL_NAMES[(profile?.level || 1) + 1] || 'Mestre'}
                                    </span>
                                </div>
                                <Progress
                                    value={currentXp % xpForNextLevel}
                                    max={xpForNextLevel}
                                    showValue={false}
                                />
                                <p className={styles.levelHint}>
                                    {xpForNextLevel - (currentXp % xpForNextLevel)} XP para o próximo nível
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className={styles.twoColumns}>
                        {/* Badges */}
                        <Card>
                            <CardHeader>
                                <CardTitle>🏅 Badges Conquistadas</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={styles.badgesGrid}>
                                    {MOCK_BADGES.map((badge) => (
                                        <div key={badge.id} className={styles.badgeItem}>
                                            <span className={styles.badgeIcon}>{badge.icon}</span>
                                            <div className={styles.badgeInfo}>
                                                <span className={styles.badgeName}>{badge.name}</span>
                                                <span className={styles.badgeDescription}>{badge.description}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* History */}
                        <Card>
                            <CardHeader>
                                <CardTitle>📊 Histórico de Treinamentos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={styles.historyList}>
                                    {MOCK_HISTORY.map((item) => (
                                        <div key={item.id} className={styles.historyItem}>
                                            <div className={styles.historyInfo}>
                                                <span className={styles.historyScenario}>{item.scenario}</span>
                                                <span className={styles.historyDate}>{item.date}</span>
                                            </div>
                                            <span className={styles.historyScore}>{item.score} pts</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </>
    );
}
