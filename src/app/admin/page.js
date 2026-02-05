'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import styles from './page.module.css';

const ADMIN_SECTIONS = [
    {
        id: 'scenarios',
        title: 'Gerenciar Cenários',
        description: 'Criar, editar e visualizar cenários de roleplay',
        icon: '🎬',
        href: '/admin/scenarios',
        stats: { label: 'Cenários ativos', value: 3 },
    },
    {
        id: 'objections',
        title: 'Biblioteca de Objeções',
        description: 'Gerenciar objeções e respostas sugeridas',
        icon: '💬',
        href: '/admin/objections',
        stats: { label: 'Objeções cadastradas', value: 8 },
    },
    {
        id: 'users',
        title: 'Gerenciar Usuários',
        description: 'Ver usuários, promover admins, resetar senhas',
        icon: '👥',
        href: '/admin/users',
        stats: { label: 'Usuários registrados', value: 10 },
    },
    {
        id: 'challenges',
        title: 'Desafios Semanais',
        description: 'Configurar desafios e metas do time',
        icon: '🏆',
        href: '/admin/challenges',
        stats: { label: 'Desafio ativo', value: 1 },
    },
];

const QUICK_STATS = [
    { label: 'Roleplays esta semana', value: 127, icon: '🎯', change: '+23%' },
    { label: 'Média de aproveitamento', value: '76%', icon: '📈', change: '+5%' },
    { label: 'Usuários ativos', value: 8, icon: '👥', change: '+2' },
    { label: 'Conclusões de cenário', value: 42, icon: '✅', change: '+12' },
];

export default function AdminDashboardPage() {
    const { user, profile, loading, isAdmin } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!user || !isAdmin)) {
            router.push('/');
        }
    }, [user, loading, isAdmin, router]);

    if (loading || !user || !isAdmin) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loader}></div>
                <p>Verificando permissões...</p>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <div className={styles.pageWrapper}>
                <Sidebar />
                <main className={styles.mainContent}>
                    <div className={styles.pageHeader}>
                        <div>
                            <h1 className={styles.pageTitle}>⚙️ Painel Admin</h1>
                            <p className={styles.pageDescription}>
                                Bem-vindo, {profile?.full_name}! Gerencie a arena de treinamento.
                            </p>
                        </div>
                        <Link href="/admin/manual">
                            <Button variant="outline">
                                📖 Manual do Admin
                            </Button>
                        </Link>
                    </div>

                    {/* Quick Stats */}
                    <div className={styles.statsGrid}>
                        {QUICK_STATS.map((stat) => (
                            <Card key={stat.label}>
                                <CardContent>
                                    <div className={styles.statCard}>
                                        <span className={styles.statIcon}>{stat.icon}</span>
                                        <div className={styles.statInfo}>
                                            <span className={styles.statValue}>{stat.value}</span>
                                            <span className={styles.statLabel}>{stat.label}</span>
                                        </div>
                                        <span className={styles.statChange}>{stat.change}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Admin Sections */}
                    <h2 className={styles.sectionTitle}>Áreas de Gestão</h2>
                    <div className={styles.sectionsGrid}>
                        {ADMIN_SECTIONS.map((section) => (
                            <Link key={section.id} href={section.href}>
                                <Card variant="hoverable" className={styles.sectionCard}>
                                    <CardContent>
                                        <div className={styles.sectionIcon}>{section.icon}</div>
                                        <h3 className={styles.sectionName}>{section.title}</h3>
                                        <p className={styles.sectionDescription}>{section.description}</p>
                                        <div className={styles.sectionStats}>
                                            <span className={styles.sectionStatValue}>{section.stats.value}</span>
                                            <span className={styles.sectionStatLabel}>{section.stats.label}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>

                    {/* Recent Activity */}
                    <Card className={styles.activityCard}>
                        <CardHeader>
                            <CardTitle>📊 Atividade Recente</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={styles.activityList}>
                                <div className={styles.activityItem}>
                                    <span className={styles.activityIcon}>🎯</span>
                                    <div className={styles.activityContent}>
                                        <span className={styles.activityText}>Maria completou "Restaurante Grande - Decisor" com 92%</span>
                                        <span className={styles.activityTime}>há 5 minutos</span>
                                    </div>
                                </div>
                                <div className={styles.activityItem}>
                                    <span className={styles.activityIcon}>🆕</span>
                                    <div className={styles.activityContent}>
                                        <span className={styles.activityText}>João Santos se registrou na plataforma</span>
                                        <span className={styles.activityTime}>há 1 hora</span>
                                    </div>
                                </div>
                                <div className={styles.activityItem}>
                                    <span className={styles.activityIcon}>🏆</span>
                                    <div className={styles.activityContent}>
                                        <span className={styles.activityText}>Ana Costa conquistou a badge "Abertura Forte"</span>
                                        <span className={styles.activityTime}>há 2 horas</span>
                                    </div>
                                </div>
                                <div className={styles.activityItem}>
                                    <span className={styles.activityIcon}>📝</span>
                                    <div className={styles.activityContent}>
                                        <span className={styles.activityText}>Desafio semanal atualizado</span>
                                        <span className={styles.activityTime}>há 1 dia</span>
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
