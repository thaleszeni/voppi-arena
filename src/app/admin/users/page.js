'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import styles from '../page.module.css';

export default function AdminUsersPage() {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [fetching, setFetching] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (!loading && (!user || !isAdmin)) {
            router.push('/');
        }
    }, [user, loading, isAdmin, router]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setFetching(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data);
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setFetching(false);
        }
    };

    const handleToggleAdmin = async (userId, currentRole) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId);

            if (error) throw error;

            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            setSuccessMessage(`Usuário atualizado para ${newRole}`);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error updating role:', err);
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
                            <h1 className={styles.pageTitle}>👥 Gerenciar Usuários</h1>
                            <p className={styles.pageDescription}>
                                Visualize e gerencie as permissões dos comerciais.
                            </p>
                        </div>
                        <Button variant="primary" onClick={() => router.push('/login')}>
                            + Criar Usuário (pelo Login)
                        </Button>
                    </div>

                    {successMessage && (
                        <div style={{ backgroundColor: '#10b981', color: 'white', padding: '10px', borderRadius: '4px', marginBottom: '20px' }}>
                            {successMessage}
                        </div>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Comerciais Cadastrados ({users.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={styles.tableWrapper}>
                                <table className={styles.adminTable} style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', borderBottom: '1px solid #333' }}>
                                            <th style={{ padding: '12px' }}>Usuário</th>
                                            <th style={{ padding: '12px' }}>Email</th>
                                            <th style={{ padding: '12px' }}>Cargo</th>
                                            <th style={{ padding: '12px' }}>Nível</th>
                                            <th style={{ padding: '12px' }}>Pontos</th>
                                            <th style={{ padding: '12px' }}>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u) => (
                                            <tr key={u.id} style={{ borderBottom: '1px solid #222' }}>
                                                <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <Avatar name={u.full_name} size="sm" />
                                                    {u.full_name}
                                                </td>
                                                <td style={{ padding: '12px' }}>{u.email}</td>
                                                <td style={{ padding: '12px' }}>
                                                    <Badge variant={u.role === 'admin' ? 'secondary' : 'outline'}>
                                                        {u.role}
                                                    </Badge>
                                                </td>
                                                <td style={{ padding: '12px' }}>N{u.level}</td>
                                                <td style={{ padding: '12px' }}>{u.total_points}</td>
                                                <td style={{ padding: '12px' }}>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleToggleAdmin(u.id, u.role)}
                                                    >
                                                        {u.role === 'admin' ? 'Remover Admin' : 'Tornar Admin'}
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {users.length === 0 && !fetching && (
                                            <tr>
                                                <td colSpan="6" style={{ padding: '20px', textAlign: 'center' }}>
                                                    Nenhum usuário encontrado.
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
