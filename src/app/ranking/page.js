'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import styles from './page.module.css';

const LEADERBOARD_DATA = [
    { rank: 1, name: 'Maria Silva', points: 4850, level: 5, badges: 8, roleplays: 23, avgScore: 87 },
    { rank: 2, name: 'João Santos', points: 4200, level: 4, badges: 6, roleplays: 19, avgScore: 82 },
    { rank: 3, name: 'Ana Costa', points: 3800, level: 4, badges: 5, roleplays: 17, avgScore: 79 },
    { rank: 4, name: 'Pedro Oliveira', points: 3500, level: 3, badges: 4, roleplays: 15, avgScore: 76 },
    { rank: 5, name: 'Lucas Pereira', points: 3100, level: 3, badges: 4, roleplays: 14, avgScore: 74 },
    { rank: 6, name: 'Julia Mendes', points: 2800, level: 3, badges: 3, roleplays: 12, avgScore: 72 },
    { rank: 7, name: 'Rafael Souza', points: 2500, level: 2, badges: 3, roleplays: 11, avgScore: 70 },
    { rank: 8, name: 'Fernanda Lima', points: 2200, level: 2, badges: 2, roleplays: 10, avgScore: 68 },
    { rank: 9, name: 'Gabriel Rocha', points: 1900, level: 2, badges: 2, roleplays: 8, avgScore: 65 },
    { rank: 10, name: 'Caetano Ribeiro', points: 1600, level: 1, badges: 1, roleplays: 6, avgScore: 62 },
];

const LEVEL_NAMES = ['', 'Abertura', 'Diagnóstico', 'Objeções', 'Proposta', 'Fechamento'];

export default function RankingPage() {
    const { user, profile, loading } = useAuth();
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

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return `#${rank}`;
        }
    };

    return (
        <>
            <Navbar />
            <div className={styles.pageWrapper}>
                <Sidebar />
                <main className={styles.mainContent}>
                    <div className={styles.pageHeader}>
                        <h1 className={styles.pageTitle}>🏆 Ranking dos Comerciais</h1>
                        <p className={styles.pageDescription}>
                            Veja quem está dominando a arena. Quem será o próximo a subir?
                        </p>
                    </div>

                    {/* Top 3 Podium */}
                    <div className={styles.podium}>
                        <div className={styles.podiumPlace + ' ' + styles.second}>
                            <div className={styles.podiumRank}>🥈</div>
                            <Avatar name={LEADERBOARD_DATA[1].name} size="lg" />
                            <div className={styles.podiumName}>{LEADERBOARD_DATA[1].name}</div>
                            <div className={styles.podiumPoints}>{LEADERBOARD_DATA[1].points.toLocaleString()} pts</div>
                            <Badge variant="secondary">N{LEADERBOARD_DATA[1].level}</Badge>
                        </div>
                        <div className={styles.podiumPlace + ' ' + styles.first}>
                            <div className={styles.podiumRank}>🥇</div>
                            <Avatar name={LEADERBOARD_DATA[0].name} size="xl" />
                            <div className={styles.podiumName}>{LEADERBOARD_DATA[0].name}</div>
                            <div className={styles.podiumPoints}>{LEADERBOARD_DATA[0].points.toLocaleString()} pts</div>
                            <Badge variant="gold">N{LEADERBOARD_DATA[0].level}</Badge>
                        </div>
                        <div className={styles.podiumPlace + ' ' + styles.third}>
                            <div className={styles.podiumRank}>🥉</div>
                            <Avatar name={LEADERBOARD_DATA[2].name} size="lg" />
                            <div className={styles.podiumName}>{LEADERBOARD_DATA[2].name}</div>
                            <div className={styles.podiumPoints}>{LEADERBOARD_DATA[2].points.toLocaleString()} pts</div>
                            <Badge variant="bronze">N{LEADERBOARD_DATA[2].level}</Badge>
                        </div>
                    </div>

                    {/* Full Leaderboard */}
                    <Card className={styles.leaderboardCard}>
                        <CardHeader>
                            <CardTitle>Ranking Completo</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={styles.leaderboardTable}>
                                <div className={styles.tableHeader}>
                                    <span className={styles.colRank}>#</span>
                                    <span className={styles.colName}>Comercial</span>
                                    <span className={styles.colLevel}>Nível</span>
                                    <span className={styles.colRoleplays}>Roleplays</span>
                                    <span className={styles.colAvg}>Média</span>
                                    <span className={styles.colPoints}>Pontos</span>
                                </div>
                                {LEADERBOARD_DATA.map((player, index) => (
                                    <div
                                        key={player.rank}
                                        className={`${styles.tableRow} ${profile?.full_name === player.name ? styles.currentUser : ''}`}
                                    >
                                        <span className={styles.colRank}>
                                            {player.rank <= 3 ? (
                                                <span className={styles.rankMedal}>{getRankIcon(player.rank)}</span>
                                            ) : (
                                                player.rank
                                            )}
                                        </span>
                                        <span className={styles.colName}>
                                            <Avatar name={player.name} size="sm" />
                                            <div className={styles.playerInfo}>
                                                <span className={styles.playerName}>{player.name}</span>
                                                <span className={styles.playerBadges}>🏅 {player.badges} badges</span>
                                            </div>
                                        </span>
                                        <span className={styles.colLevel}>
                                            <Badge variant="outline" size="sm">
                                                N{player.level} • {LEVEL_NAMES[player.level]}
                                            </Badge>
                                        </span>
                                        <span className={styles.colRoleplays}>{player.roleplays}</span>
                                        <span className={styles.colAvg}>{player.avgScore}%</span>
                                        <span className={styles.colPoints}>{player.points.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats Cards */}
                    <div className={styles.statsGrid}>
                        <Card>
                            <CardContent>
                                <div className={styles.statCard}>
                                    <span className={styles.statIcon}>🎯</span>
                                    <div className={styles.statInfo}>
                                        <span className={styles.statValue}>127</span>
                                        <span className={styles.statLabel}>Roleplays esta semana</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent>
                                <div className={styles.statCard}>
                                    <span className={styles.statIcon}>📈</span>
                                    <div className={styles.statInfo}>
                                        <span className={styles.statValue}>76%</span>
                                        <span className={styles.statLabel}>Média geral do time</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent>
                                <div className={styles.statCard}>
                                    <span className={styles.statIcon}>🏆</span>
                                    <div className={styles.statInfo}>
                                        <span className={styles.statValue}>Maria</span>
                                        <span className={styles.statLabel}>Destaque da semana</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </>
    );
}
