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

    // Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newUser, setNewUser] = useState({ fullName: '', email: '', password: '' });
    const [showEditModal, setShowEditModal] = useState(false);
    const [userToEdit, setUserToEdit] = useState({ id: '', fullName: '', email: '' });

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
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'list_users' })
            });
            const data = await res.json();

            if (data.users) {
                setUsers(data.users);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setFetching(false);
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            await callAdminApi('update_user', userToEdit.id, null, {
                fullName: userToEdit.fullName,
                email: userToEdit.email,
                password: userToEdit.password // Include password if set
            });
            setShowEditModal(false);
            setUserToEdit({ id: '', fullName: '', email: '', password: '' });
            fetchUsers();
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await callAdminApi('create_user', null, null, newUser);
            setShowCreateModal(false);
            setNewUser({ fullName: '', email: '', password: '' });
            fetchUsers();
        } catch (err) {
            console.error(err);
        }
    };

    const callAdminApi = async (action, userId, newPassword = null, extraData = {}) => {
        try {
            const body = { action, userId, newPassword, ...extraData };

            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Erro na requisição');

            setSuccessMessage(data.message);
            setTimeout(() => setSuccessMessage(''), 4000);

            // Refresh list if needed (optional)
        } catch (err) {
            console.error('Admin Action Error:', err);
            alert(`Erro: ${err.message}`);
            // throw err; // Optional rethrow if needed
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
                            <h1 className={styles.pageTitle}>👥 Gerenciar Usuários (v2.1)</h1>
                            <p className={styles.pageDescription}>
                                Visualize e gerencie as permissões dos comerciais.
                            </p>
                        </div>
                        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                            + Criar Usuário
                        </Button>
                    </div>

                    {showCreateModal && (
                        <div style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <div style={{
                                backgroundColor: '#1a1a1a', padding: '24px', borderRadius: '12px',
                                width: '100%', maxWidth: '400px', border: '1px solid #333'
                            }}>
                                <h3 style={{ marginBottom: '16px', color: 'white' }}>Criar Novo Usuário</h3>
                                <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <Input
                                        label="Nome Completo"
                                        value={newUser.fullName}
                                        onChange={e => setNewUser({ ...newUser, fullName: e.target.value })}
                                        required
                                    />
                                    <Input
                                        label="E-mail"
                                        type="email"
                                        value={newUser.email}
                                        onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                        required
                                    />
                                    <Input
                                        label="Senha Inicial"
                                        type="password"
                                        value={newUser.password}
                                        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                        required
                                    />
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                        <Button type="button" variant="ghost" fullWidth onClick={() => setShowCreateModal(false)}>
                                            Cancelar
                                        </Button>
                                        <Button type="submit" variant="primary" fullWidth>
                                            Criar Conta
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

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
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleToggleAdmin(u.id, u.role)}
                                                        >
                                                            {u.role === 'admin' ? '⬇️ User' : '⬆️ Admin'}
                                                        </Button>

                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={async () => {
                                                                setUserToEdit({
                                                                    id: u.id,
                                                                    fullName: u.full_name || '',
                                                                    email: u.email || ''
                                                                });
                                                                setShowEditModal(true);
                                                            }}
                                                        >
                                                            ✏️ Editar
                                                        </Button>

                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={async () => {
                                                                if (!confirm(`Confirmar e-mail de ${u.full_name} manualmente?`)) return;
                                                                await callAdminApi('confirm_email', u.id);
                                                            }}
                                                        >
                                                            ✅ Confirmar
                                                        </Button>

                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={async () => {
                                                                const newPass = prompt(`Nova senha para ${u.full_name}:`);
                                                                if (!newPass) return;
                                                                await callAdminApi('reset_password', u.id, newPass);
                                                            }}
                                                        >
                                                            🔑 Senha
                                                        </Button>

                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            onClick={async () => {
                                                                if (!confirm(`Tem certeza que deseja DELETAR ${u.full_name}? Isso não tem volta.`)) return;
                                                                await callAdminApi('delete_user', u.id);
                                                                // Remove da lista localmente
                                                                setUsers(users.filter(user => user.id !== u.id));
                                                            }}
                                                        >
                                                            🗑️
                                                        </Button>
                                                    </div>
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

                    {showEditModal && (
                        <div style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <div style={{
                                backgroundColor: '#1a1a1a', padding: '24px', borderRadius: '12px',
                                width: '100%', maxWidth: '400px', border: '1px solid #333'
                            }}>
                                <h3 style={{ marginBottom: '16px', color: 'white' }}>Editar Usuário</h3>
                                <form onSubmit={handleUpdateUser} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <Input
                                        label="Nome Completo"
                                        value={userToEdit.fullName}
                                        onChange={e => setUserToEdit({ ...userToEdit, fullName: e.target.value })}
                                        required
                                    />
                                    <Input
                                        label="E-mail"
                                        type="email"
                                        value={userToEdit.email}
                                        onChange={e => setUserToEdit({ ...userToEdit, email: e.target.value })}
                                        required
                                    />
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                        <Button type="button" variant="ghost" fullWidth onClick={() => setShowEditModal(false)}>
                                            Cancelar
                                        </Button>
                                        <Button type="submit" variant="primary" fullWidth>
                                            Salvar
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
