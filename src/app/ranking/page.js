'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import styles from './page.module.css';

const LEVEL_NAMES = ['', 'Abertura', 'Diagnóstico', 'Objeções', 'Proposta', 'Fechamento'];

export default function RankingPage() {
    const { user, profile, loading } = useAuth();
    const [leaderboard, setLeaderboard] = useState([]);
    const [fetchingRank, setFetchingRank] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        async function fetchRanking() {
            if (!user) return;
            console.log("Fetching ranking for user:", user.id);

            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .order('total_points', { ascending: false })
                    .limit(20);

                if (error) {
                    console.error('Error fetching ranking:', error);
                } else {
                    console.log("Ranking data:", data);
                    setLeaderboard(data.map((p, i) => ({
                        rank: i + 1,
                        name: p.full_name || 'Usuário',
                        points: p.total_points || 0,
                        level: p.level || 1,
                        badges: 3, // Placeholder
                        roleplays: 5, // Placeholder
                        avgScore: 75 // Placeholder
                    })));
                }
            } catch (err) {
                console.error('Exception fetching ranking:', err);
            } finally {
                setFetchingRank(false);
            }
        }
        fetchRanking();
    }, [user]);

    if (loading || !user || fetchingRank) {
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
                            <Avatar name={leaderboard[1]?.name || '...'} size="lg" />
                            <div className={styles.podiumName}>{leaderboard[1]?.name || 'Carregando...'}</div>
                            <div className={styles.podiumPoints}>{(leaderboard[1]?.points || 0).toLocaleString()} pts</div>
                            <Badge variant="secondary">N{leaderboard[1]?.level || 1}</Badge>
                        </div>
                        <div className={styles.podiumPlace + ' ' + styles.first}>
                            <div className={styles.podiumRank}>🥇</div>
                            <Avatar name={leaderboard[0]?.name || '...'} size="xl" />
                            <div className={styles.podiumName}>{leaderboard[0]?.name || 'Carregando...'}</div>
                            <div className={styles.podiumPoints}>{(leaderboard[0]?.points || 0).toLocaleString()} pts</div>
                            <Badge variant="gold">N{leaderboard[0]?.level || 1}</Badge>
                        </div>
                        <div className={styles.podiumPlace + ' ' + styles.third}>
                            <div className={styles.podiumRank}>🥉</div>
                            <Avatar name={leaderboard[2]?.name || '...'} size="lg" />
                            <div className={styles.podiumName}>{leaderboard[2]?.name || 'Carregando...'}</div>
                            <div className={styles.podiumPoints}>{(leaderboard[2]?.points || 0).toLocaleString()} pts</div>
                            <Badge variant="bronze">N{leaderboard[2]?.level || 1}</Badge>
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
                                {leaderboard.map((player, index) => (
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
