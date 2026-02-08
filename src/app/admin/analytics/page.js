'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import styles from './page.module.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AnalyticsDashboard() {
    const { user, profile, loading: authLoading, isAdmin } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        scenarioStats: [],
        objectionHeatmap: [],
        skillRadar: [],
        timelineData: [],
        totalAttempts: 0,
        avgScore: 0
    });

    useEffect(() => {
        if (!authLoading && (!user || !isAdmin)) {
            router.push('/');
        } else if (!authLoading && user && isAdmin) {
            fetchAnalytics();
        }
    }, [user, authLoading, isAdmin, router]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            // Fetch attempts with scenario info
            const { data: attempts, error: attemptsError } = await supabase
                .from('attempts')
                .select(`
                    *,
                    scenarios (
                        title,
                        slug
                    )
                `)
                .order('completed_at', { ascending: true });

            if (attemptsError) throw attemptsError;

            // 1. Timeline Data (Roleplays over time)
            const timeline = processTimeline(attempts);

            // 2. Scenario Success Funnel
            const scenarioPerformance = processScenarioStats(attempts);

            // 3. Skill Radar (Aggregate)
            const skills = processSkillRadar(attempts);

            // 4. Objection Heatmap (Mocked for now since we don't store failing objection IDs yet, 
            // but we can infer from choice history in the future)
            const objections = [
                { name: 'Preço/697', fails: 45, success: 55 },
                { name: 'Já tenho Groupon', fails: 30, success: 70 },
                { name: 'Público Qualificado', fails: 15, success: 85 },
                { name: 'Taxa de Setup', fails: 40, success: 60 },
                { name: 'Fidelidade', fails: 20, success: 80 },
            ];

            setStats({
                timelineData: timeline,
                scenarioStats: scenarioPerformance,
                skillRadar: skills,
                objectionHeatmap: objections,
                totalAttempts: attempts.length,
                avgScore: Math.round(attempts.reduce((acc, curr) => acc + (curr.total_score || 0), 0) / (attempts.length || 1))
            });
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const processTimeline = (attempts) => {
        const groups = {};
        attempts.forEach(attr => {
            const date = new Date(attr.completed_at).toLocaleDateString();
            groups[date] = (groups[date] || 0) + 1;
        });
        return Object.entries(groups).map(([name, count]) => ({ name, count }));
    };

    const processScenarioStats = (attempts) => {
        const stats = {};
        attempts.forEach(attr => {
            const name = attr.scenarios?.title || 'Desconhecido';
            if (!stats[name]) {
                stats[name] = { name, total: 0, success: 0 };
            }
            stats[name].total += 1;
            if (attr.result === 'success') stats[name].success += 1;
        });
        return Object.values(stats).map(s => ({
            ...s,
            rate: Math.round((s.success / s.total) * 100)
        }));
    };

    const processSkillRadar = (attempts) => {
        const skills = {
            'Estratégia': 0,
            'Clareza': 0,
            'Tom de Voz': 0,
            'Diagnóstico': 0,
            'Fechamento': 0
        };
        attempts.forEach(attr => {
            skills['Estratégia'] += attr.score_strategy || 0;
            skills['Clareza'] += attr.score_clarity || 0;
            skills['Tom de Voz'] += attr.score_tone || 0;
            skills['Diagnóstico'] += attr.score_diagnosis || 0;
            skills['Fechamento'] += attr.score_closing || 0;
        });
        const count = attempts.length || 1;
        return Object.entries(skills).map(([subject, value]) => ({
            subject,
            A: Math.round(value / count),
            fullMark: 100
        }));
    };

    if (loading || authLoading) {
        return <div className={styles.loading}>Carregando métricas...</div>;
    }

    return (
        <>
            <Navbar />
            <div className={styles.pageWrapper}>
                <Sidebar />
                <main className={styles.mainContent}>
                    <div className={styles.header}>
                        <div>
                            <h1 className={styles.pageTitle}>📊 Analytics Voppi</h1>
                            <p className={styles.pageDescription}>
                                Identifique furos de conhecimento e otimize o onboarding.
                            </p>
                        </div>
                        <Button onClick={fetchAnalytics} variant="outline">🔄 Atualizar</Button>
                    </div>

                    {/* Top Stats */}
                    <div className={styles.statsGrid}>
                        <Card>
                            <CardContent className={styles.statCardContent}>
                                <span className={styles.statLabel}>Total de Roleplays</span>
                                <span className={styles.statValue}>{stats.totalAttempts}</span>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className={styles.statCardContent}>
                                <span className={styles.statLabel}>Média de Pontuação</span>
                                <span className={styles.statValue}>{stats.avgScore}</span>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className={styles.statCardContent}>
                                <span className={styles.statLabel}>Taxa de Sucesso Geral</span>
                                <span className={styles.statValue}>
                                    {Math.round(stats.scenarioStats.reduce((acc, s) => acc + s.rate, 0) / (stats.scenarioStats.length || 1))}%
                                </span>
                            </CardContent>
                        </Card>
                    </div>

                    <div className={styles.chartsGrid}>
                        {/* Timeline */}
                        <Card className={styles.chartCard}>
                            <CardHeader><CardTitle>Timeline de Treinamentos</CardTitle></CardHeader>
                            <CardContent>
                                <div className={styles.chartContainer}>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={stats.timelineData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="count" stroke="#0088FE" strokeWidth={3} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Radar - Skill Breakdown */}
                        <Card className={styles.chartCard}>
                            <CardHeader><CardTitle>Média de Habilidades (Geral)</CardTitle></CardHeader>
                            <CardContent>
                                <div className={styles.chartContainer}>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats.skillRadar}>
                                            <PolarGrid />
                                            <PolarAngleAxis dataKey="subject" />
                                            <Radar name="Time" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                            <Tooltip />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Bar - Objection Heatmap */}
                        <Card className={styles.chartCard}>
                            <CardHeader><CardTitle>Furos em Objeções (% de Falha)</CardTitle></CardHeader>
                            <CardContent>
                                <div className={styles.chartContainer}>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={stats.objectionHeatmap}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="fails" fill="#FF8042" name="Taxa de Falha (%)" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Bar - Success per Scenario */}
                        <Card className={styles.chartCard}>
                            <CardHeader><CardTitle>Sucesso por Cenário</CardTitle></CardHeader>
                            <CardContent>
                                <div className={styles.chartContainer}>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={stats.scenarioStats} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" domain={[0, 100]} />
                                            <YAxis dataKey="name" type="category" width={100} />
                                            <Tooltip />
                                            <Bar dataKey="rate" fill="#00C49F" name="Sucesso (%)" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </>
    );
}
