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
import { OBJECTIONS_DATA } from '@/lib/objections';
import styles from '../page.module.css';

export default function AdminObjectionsPage() {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();
    const [objections, setObjections] = useState([]);
    const [fetching, setFetching] = useState(true);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (!loading && (!user || !isAdmin)) {
            router.push('/');
        }
    }, [user, loading, isAdmin, router]);

    useEffect(() => {
        fetchObjections();
    }, []);

    const fetchObjections = async () => {
        setFetching(true);
        try {
            const { data, error } = await supabase
                .from('objections')
                .select('*')
                .order('category', { ascending: true });

            if (error) throw error;
            setObjections(data);
        } catch (err) {
            console.error('Error fetching objections:', err);
        } finally {
            setFetching(false);
        }
    };

    const handleSeed = async () => {
        try {
            // Map code data to DB structure
            const dbData = OBJECTIONS_DATA.map(obj => ({
                objection: obj.objection,
                category: obj.category,
                response1: obj.response1,
                response2: obj.response2,
                strategic_objective: obj.strategicObjective,
                is_active: true
            }));

            const { error } = await supabase
                .from('objections')
                .insert(dbData);

            if (error) throw error;

            setSuccessMessage('Biblioteca de objeções sincronizada com o banco de dados!');
            fetchObjections();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error seeding objections:', err);
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
                            <h1 className={styles.pageTitle}>💬 Biblioteca de Objeções</h1>
                            <p className={styles.pageDescription}>
                                Gerencie as objeções reais dos parceiros Voppi e as respostas recomendadas.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <Button variant="outline" onClick={handleSeed}>
                                🔄 Sincronizar da Lib
                            </Button>
                            <Button variant="primary">
                                + Nova Objeção
                            </Button>
                        </div>
                    </div>

                    {successMessage && (
                        <div style={{ backgroundColor: '#10b981', color: 'white', padding: '10px', borderRadius: '4px', marginBottom: '20px' }}>
                            {successMessage}
                        </div>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Objeções Registradas ({objections.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={styles.tableWrapper}>
                                <table className={styles.adminTable} style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', borderBottom: '1px solid #333' }}>
                                            <th style={{ padding: '12px' }}>Objeção</th>
                                            <th style={{ padding: '12px' }}>Categoria</th>
                                            <th style={{ padding: '12px' }}>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {objections.map((obj) => (
                                            <tr key={obj.id} style={{ borderBottom: '1px solid #222' }}>
                                                <td style={{ padding: '12px' }}>
                                                    <div style={{ fontWeight: 'bold' }}>{obj.objection}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '4px' }}>
                                                        OBJ: {obj.strategic_objective}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px' }}>
                                                    <Badge variant="outline">{obj.category}</Badge>
                                                </td>
                                                <td style={{ padding: '12px' }}>
                                                    <Button variant="ghost" size="sm">Editar</Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {objections.length === 0 && !fetching && (
                                            <tr>
                                                <td colSpan="3" style={{ padding: '20px', textAlign: 'center' }}>
                                                    Nenhuma objeção encontrada no banco de dados.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </>
    );
}
