'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import styles from '../../../page.module.css';

export default function EditScenarioPage() {
    const { user, isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const [formData, setFormData] = useState({
        slug: '',
        title: '',
        description: '',
        category: '',
        difficulty: 3,
        duration: '',
        icon: '',
        skills: '',
        start_node_id: '',
        nodesJSON: ''
    });

    const [isSaving, setIsSaving] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!authLoading && (!user || !isAdmin)) {
            router.push('/');
        }
    }, [user, authLoading, isAdmin, router]);

    useEffect(() => {
        if (id) fetchScenario();
    }, [id]);

    const fetchScenario = async () => {
        setIsFetching(true);
        try {
            const { data, error: fetchError } = await supabase
                .from('scenarios')
                .select('*')
                .eq('id', id)
                .single();

            if (fetchError) throw fetchError;

            setFormData({
                slug: data.slug,
                title: data.title,
                description: data.description || '',
                category: data.category,
                difficulty: data.difficulty,
                duration: data.duration || '',
                icon: data.icon || '',
                skills: (data.skills || []).join(', '),
                start_node_id: data.start_node_id,
                nodesJSON: JSON.stringify(data.nodes, null, 2)
            });
        } catch (err) {
            console.error('Error fetching scenario:', err);
            setError('Falha ao carregar cenário.');
        } finally {
            setIsFetching(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');

        try {
            let nodes;
            try {
                nodes = JSON.parse(formData.nodesJSON);
            } catch (err) {
                throw new Error('O JSON dos nós é inválido.');
            }

            const { error: updateError } = await supabase
                .from('scenarios')
                .update({
                    slug: formData.slug,
                    title: formData.title,
                    description: formData.description,
                    category: formData.category,
                    difficulty: parseInt(formData.difficulty),
                    duration: formData.duration,
                    icon: formData.icon,
                    skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
                    start_node_id: formData.start_node_id,
                    nodes: nodes,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (updateError) throw updateError;

            router.push('/admin/scenarios');
        } catch (err) {
            console.error('Error updating scenario:', err);
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (authLoading || isFetching) return <div className={styles.loadingContainer}><div className={styles.loader}></div></div>;
    if (!user || !isAdmin) return null;

    return (
        <>
            <Navbar />
            <div className={styles.pageWrapper}>
                <Sidebar />
                <main className={styles.mainContent}>
                    <div className={styles.pageHeader}>
                        <div>
                            <h1 className={styles.pageTitle}>✏️ Editar Cenário</h1>
                            <p className={styles.pageDescription}>Modificando: {formData.title}</p>
                        </div>
                        <Button variant="outline" onClick={() => router.back()}>Cancelar</Button>
                    </div>

                    <Card>
                        <CardContent>
                            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <Input
                                        label="Slug (URL)"
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleChange}
                                        required
                                    />
                                    <Input
                                        label="Título"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <Input
                                    label="Descrição"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                />

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                                    <Input
                                        label="Categoria"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                    />
                                    <Input
                                        label="Dificuldade (1-5)"
                                        name="difficulty"
                                        type="number"
                                        min="1"
                                        max="5"
                                        value={formData.difficulty}
                                        onChange={handleChange}
                                    />
                                    <Input
                                        label="Ícone"
                                        name="icon"
                                        value={formData.icon}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <Input
                                        label="Habilidades (separadas por vírgula)"
                                        name="skills"
                                        value={formData.skills}
                                        onChange={handleChange}
                                    />
                                    <Input
                                        label="ID do Nó Inicial"
                                        name="start_node_id"
                                        value={formData.start_node_id}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>Nós do Cenário (JSON)</label>
                                    <textarea
                                        name="nodesJSON"
                                        value={formData.nodesJSON}
                                        onChange={handleChange}
                                        style={{
                                            width: '100%',
                                            height: '400px',
                                            backgroundColor: '#111',
                                            color: '#00ff41',
                                            padding: '15px',
                                            borderRadius: '8px',
                                            fontFamily: 'monospace',
                                            border: '1px solid #333'
                                        }}
                                        spellCheck="false"
                                    />
                                </div>

                                {error && (
                                    <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '4px' }}>
                                        {error}
                                    </div>
                                )}

                                <Button type="submit" variant="primary" disabled={isSaving}>
                                    {isSaving ? 'Salvando...' : 'Atualizar Cenário'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div style={{ marginTop: '40px' }}>
                        <h3>🔧 Dicas para Customização Granular</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '15px' }}>
                            Para controlar quais opções aparecem em uma objeção, use a estrutura abaixo no seu JSON de nós:
                        </p>
                        <Card>
                            <CardContent>
                                <pre style={{ fontSize: '0.85rem', color: '#00ff41' }}>{`{
  "node-id": {
    "id": "node-id",
    "type": "objection_slot",
    "fixedChoices": [
      {
        "id": "choice-1",
        "text": "Sua resposta customizada aqui",
        "points": { "strategy": 90, "clarity": 80, ... },
        "feedback": "...",
        "nextNodeId": "node-proximo"
      },
      {
        "id": "choice-2",
        "text": "Outra opção estratégica",
        "points": { "strategy": 40, ... },
        "nextNodeId": "node-proximo"
      }
    ]
  }
}`}</pre>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </>
    );
}
