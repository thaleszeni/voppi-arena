'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import styles from '../page.module.css';

import { SCENARIOS_DATA } from '@/lib/scenarios';

const DEFAULT_SCENARIOS = Object.values(SCENARIOS_DATA).map(s => ({
    slug: s.id, // Using s.id as slug
    title: s.title,
    description: s.description,
    category: s.category,
    difficulty: s.difficulty,
    duration: s.duration || '10-15 min',
    icon: s.icon,
    skills: s.skills || [],
    start_node_id: s.startNodeId,
    nodes: s.nodes,
    is_active: true
}));

export default function AdminScenariosPage() {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();
    const [scenarios, setScenarios] = useState([]);
    const [fetching, setFetching] = useState(true);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (!loading && (!user || !isAdmin)) {
            router.push('/');
        }
    }, [user, loading, isAdmin, router]);

    useEffect(() => {
        fetchScenarios();
    }, []);

    const fetchScenarios = async () => {
        setFetching(true);
        try {
            const { data, error } = await supabase
                .from('scenarios')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setScenarios(data);
        } catch (err) {
            console.error('Error fetching scenarios:', err);
        } finally {
            setFetching(false);
        }
    };

    const handleSeed = async () => {
        try {
            const { error } = await supabase
                .from('scenarios')
                .insert(DEFAULT_SCENARIOS);

            if (error) throw error;

            setSuccessMessage('Cenários iniciais criados com sucesso!');
            fetchScenarios();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error seeding scenarios:', err);
        }
    };

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
                            <h1 className={styles.pageTitle}>🎬 Gerenciar Cenários</h1>
                            <p className={styles.pageDescription}>
                                Crie e edite os desafios de roleplay disponíveis na arena.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <Button variant="outline" onClick={handleSeed}>
                                🌱 Seed Inicial
                            </Button>
                            <Button variant="primary">
                                + Novo Cenário
                            </Button>
                        </div>
                    </div>

                    {successMessage && (
                        <div style={{ backgroundColor: '#10b981', color: 'white', padding: '10px', borderRadius: '4px', marginBottom: '20px' }}>
                            {successMessage}
                        </div>
                    )}

                    <div className={styles.sectionsGrid}>
                        {scenarios.map((s) => (
                            <Card key={s.id} variant="hoverable" className={styles.sectionCard}>
                                <CardContent>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <div className={styles.sectionIcon}>{s.icon}</div>
                                        <Badge variant="secondary">{'⭐'.repeat(s.difficulty)}</Badge>
                                    </div>
                                    <h3 className={styles.sectionName}>{s.title}</h3>
                                    <p className={styles.sectionDescription}>{s.description}</p>
                                    <div style={{ marginTop: '15px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                        {(s.skills || []).map(skill => (
                                            <Badge key={skill} variant="outline" size="sm">{skill}</Badge>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                                        <Button variant="ghost" size="sm">Editar</Button>
                                        <Button variant="ghost" size="sm" style={{ color: '#ef4444' }}>Excluir</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {scenarios.length === 0 && !fetching && (
                        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#111', borderRadius: '8px' }}>
                            <p>Nenhum cenário cadastrado no banco de dados.</p>
                            <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '10px' }}>
                                Use o botão "Seed Inicial" para carregar os cenários padrão.
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
