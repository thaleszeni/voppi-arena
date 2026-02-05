'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Card, { CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import styles from './page.module.css';

const SCENARIOS = [
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
    },
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
    },
];

export default function RoleplayListPage() {
    const { user, loading } = useAuth();
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
                        {SCENARIOS.map((scenario) => (
                            <Link
                                key={scenario.id}
                                href={`/roleplay/${scenario.id}`}
                                className={styles.scenarioCard}
                            >
                                <div className={styles.scenarioHeader}>
                                    <div className={styles.scenarioIcon}>{scenario.icon}</div>
                                    <div className={styles.scenarioDifficulty}>
                                        {'⭐'.repeat(scenario.difficulty)}
                                    </div>
                                </div>

                                <h3 className={styles.scenarioTitle}>{scenario.title}</h3>
                                <p className={styles.scenarioDescription}>{scenario.description}</p>

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

                                <div className={styles.scenarioAction}>
                                    <span>Iniciar Treino</span>
                                    <span>→</span>
                                </div>
                            </Link>
                        ))}
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
                </main>
            </div>
        </>
    );
}
