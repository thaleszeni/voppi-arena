'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import styles from '../page.module.css';

export default function AdminChallengesPage() {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();
    const [challenges, setChallenges] = useState([]);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (!loading && (!user || !isAdmin)) {
            router.push('/');
        }
    }, [user, loading, isAdmin, router]);

    useEffect(() => {
        fetchChallenges();
    }, []);

    const fetchChallenges = async () => {
        setFetching(true);
        try {
            const { data, error } = await supabase
                .from('weekly_challenges')
                .select('*')
                .order('end_date', { ascending: false });

            if (error) throw error;
            setChallenges(data);
        } catch (err) {
            console.error('Error fetching challenges:', err);
        } finally {
            setFetching(false);
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
                            <h1 className={styles.pageTitle}>🏆 Desafios Semanais</h1>
                            <p className={styles.pageDescription}>
                                Configure metas e premiações XP para o time.
                            </p>
                        </div>
                        <Button variant="primary">
                            + Novo Desafio
                        </Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Histórico de Desafios</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                {challenges.length > 0 ? (
                                    <p>Funcionalidade em desenvolvimento...</p>
                                ) : (
                                    <>
                                        <p>Nenhum desafio ativo ou histórico encontrado.</p>
                                        <p style={{ fontSize: '0.8rem', marginTop: '10px' }}>
                                            Os desafios incentivam a equipe a praticar cenários específicos.
                                        </p>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </>
    );
}
