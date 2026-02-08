'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Card, { CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import styles from './page.module.css';

const INITIAL_SCENARIOS = [
    {
        id: 'restaurante-gatekeeper',
        title: 'Restaurante - Gatekeeper',
        description: 'Estratégia para passar pelo funcionário e chegar ao decisor. Técnicas de rapport e persuasão.',
        category: 'restaurant_gatekeeper',
        difficulty: 2,
        duration: '8-12 min',
        icon: '🚪',
        skills: ['Abertura', 'Rapport', 'Persuasão'],
        completions: 38,
        avgScore: 720,
        minLevel: 1
    },
    {
        id: 'restaurante-decisor',
        title: 'Restaurante Grande - Decisor',
        description: 'Abordagem direta ao proprietário de um restaurante de grande porte. Foco em diagnóstico e proposta de valor.',
        category: 'restaurant_decision_maker',
        difficulty: 3,
        duration: '10-15 min',
        icon: '🍽️',
        skills: ['Abertura', 'Diagnóstico', 'Objeções', 'Fechamento'],
        completions: 45,
        avgScore: 780,
        minLevel: 3,
        prerequisites: ['restaurante-gatekeeper']
    },
    {
        id: 'parque-atracao',
        title: 'Parque / Atração Turística',
        description: 'Abordagem B2B para parques e atrações de grande volume. Foco em sazonalidade e parcerias.',
        category: 'park',
        difficulty: 4,
        duration: '12-18 min',
        icon: '🎢',
        skills: ['Diagnóstico', 'Negociação', 'Proposta', 'Fechamento'],
        completions: 22,
        avgScore: 690,
        minLevel: 5,
        prerequisites: ['restaurante-decisor']
    },
];

export default function RoleplayListPage() {
    const { user, profile, loading } = useAuth();
    const router = useRouter();
    const [scenarios, setScenarios] = useState([]);
    const [completedSlugs, setCompletedSlugs] = useState([]);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        async function fetchData() {
            setFetching(true);
            try {
                // 1. Fetch user's successful attempts
                const { data: history } = await supabase
                    .from('attempts')
                    .select('scenario_slug')
                    .eq('user_id', user.id)
                    .eq('result', 'success');

                const successes = new Set(history?.map(h => h.scenario_slug) || []);
                setCompletedSlugs(Array.from(successes));

                // 2. Fetch scenarios
                const { data, error } = await supabase
                    .from('scenarios')
                    .select('*')
                    .eq('is_active', true)
                    .order('difficulty', { ascending: true });

                let list = [];
                // Check if data exists AND has length
                if (!error && data && data.length > 0) {
                    console.log("Scenarios loaded from DB:", data.length);
                    list = data.map(s => {
                        const localMeta = INITIAL_SCENARIOS.find(i => i.id === (s.slug || s.id)) || {};
                        return {
                            id: s.slug || s.id,
                            title: s.title,
                            description: s.description,
                            category: s.category,
                            difficulty: s.difficulty,
                            duration: s.duration || '10-15 min',
                            icon: s.icon || '🎯',
                            skills: s.skills || ['Geral'],
                            // Ensure minLevel always has a value
                            minLevel: s.min_level || localMeta.minLevel || 1,
                            prerequisites: s.prerequisites || localMeta.prerequisites || [],
                            completions: 0,
                            avgScore: 0
                        };
                    });
                } else {
                    console.log("Using INITIAL_SCENARIOS fallback (DB empty or error). Error:", error);
                    list = INITIAL_SCENARIOS;
                }

                // Apply locking logic
                const userLevel = profile?.level || 1;
                const scenariosWithLock = list.map(s => {
                    const levelLocked = userLevel < s.minLevel;
                    const prereqLocked = s.prerequisites?.some(pre => !successes.has(pre));
                    return {
                        ...s,
                        isLocked: levelLocked || prereqLocked,
                        lockReason: levelLocked
                            ? `Nível ${s.minLevel} necessário`
                            : (prereqLocked ? 'Conclua os cenários anteriores' : null)
                    };
                });

                setScenarios(scenariosWithLock);

            } catch (err) {
                console.error('Error fetching data:', err);
                setScenarios(INITIAL_SCENARIOS);
            } finally {
                setFetching(false);
            }
        }
        if (user) fetchData();
    }, [user, profile]);

    if (loading || !user) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loader}></div>
                <p>Carregando...</p>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <div className={styles.pageWrapper}>
                <Sidebar />
                <main className={styles.mainContent}>
                    {/* Header */}
                    <div className={styles.pageHeader}>
                        <div className={styles.headerContent}>
                            <h1 className={styles.pageTitle}>🎯 Arena de Roleplay</h1>
                            <p className={styles.pageDescription}>
                                Escolha um cenário e coloque suas habilidades à prova. Cada decisão importa!
                            </p>
                        </div>
                    </div>

                    {/* Weekly Challenge Banner */}
                    <div className={styles.challengeBanner}>
                        <div className={styles.challengeIcon}>🏆</div>
                        <div className={styles.challengeContent}>
                            <h3>Desafio da Semana</h3>
                            <p>Complete o cenário "Restaurante Grande - Decisor" com score acima de 850 pontos</p>
                        </div>
                        <div className={styles.challengeReward}>
                            <span className={styles.rewardValue}>+100</span>
                            <span className={styles.rewardLabel}>XP Bônus</span>
                        </div>
                    </div>

                    {/* Scenarios Grid */}
                    <div className={styles.scenariosGrid}>
                        {scenarios.map((scenario) => {
                            return (
                                <div
                                    key={scenario.id}
                                    className={`${styles.scenarioCard} ${scenario.isLocked ? styles.locked : ''}`}
                                >
                                    <div className={styles.scenarioHeader}>
                                        <div className={styles.scenarioIcon}>
                                            {scenario.isLocked ? '🔒' : scenario.icon}
                                        </div>
                                        <div className={styles.scenarioDifficulty}>
                                            {'⭐'.repeat(scenario.difficulty)}
                                        </div>
                                    </div>

                                    <h3 className={styles.scenarioTitle}>{scenario.title}</h3>
                                    <p className={styles.scenarioDescription}>{scenario.description}</p>

                                    {scenario.isLocked && (
                                        <div className={styles.lockInfo}>
                                            <Badge variant="danger" size="sm">{scenario.lockReason}</Badge>
                                        </div>
                                    )}

                                    <div className={styles.scenarioSkills}>
                                        {scenario.skills.map((skill) => (
                                            <Badge key={skill} variant="outline" size="sm">{skill}</Badge>
                                        ))}
                                    </div>

                                    <div className={styles.scenarioMeta}>
                                        <div className={styles.scenarioStat}>
                                            <span className={styles.statIcon}>⏱️</span>
                                            <span>{scenario.duration}</span>
                                        </div>
                                        <div className={styles.scenarioStat}>
                                            <span className={styles.statIcon}>👥</span>
                                            <span>{scenario.completions} treinos</span>
                                        </div>
                                        <div className={styles.scenarioStat}>
                                            <span className={styles.statIcon}>📈</span>
                                            <span>Média: {scenario.avgScore}</span>
                                        </div>
                                    </div>

                                    {!scenario.isLocked && (
                                        <div className={styles.scenarioActions}>
                                            <Link href={`/roleplay/${scenario.id}`} className={styles.actionBtn}>
                                                <Button variant="outline" size="sm" fullWidth>Guided</Button>
                                            </Link>
                                            <Link href={`/roleplay/chat/${scenario.id}`} className={styles.actionBtn}>
                                                <Button variant="primary" size="sm" fullWidth>Chat IA</Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Tips Section */}
                    <Card className={styles.tipsCard}>
                        <CardContent>
                            <h3 className={styles.tipsTitle}>💡 Dicas para um bom roleplay</h3>
                            <div className={styles.tipsGrid}>
                                <div className={styles.tipItem}>
                                    <span className={styles.tipIcon}>🎯</span>
                                    <div>
                                        <strong>Leia com atenção</strong>
                                        <p>Entenda o contexto antes de responder</p>
                                    </div>
                                </div>
                                <div className={styles.tipItem}>
                                    <span className={styles.tipIcon}>💭</span>
                                    <div>
                                        <strong>Pense estrategicamente</strong>
                                        <p>Cada resposta tem um objetivo</p>
                                    </div>
                                </div>
                                <div className={styles.tipItem}>
                                    <span className={styles.tipIcon}>📝</span>
                                    <div>
                                        <strong>Aprenda com o feedback</strong>
                                        <p>O sistema mostra o raciocínio ideal</p>
                                    </div>
                                </div>
                                <div className={styles.tipItem}>
                                    <span className={styles.tipIcon}>🔄</span>
                                    <div>
                                        <strong>Refaça os cenários</strong>
                                        <p>Explore caminhos diferentes</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </main >
            </div >
        </>
    );
}
