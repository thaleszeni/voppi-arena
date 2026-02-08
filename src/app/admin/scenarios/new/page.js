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
import styles from '../../page.module.css';

import { OBJECTIONS_DATA } from '@/lib/objections';

export default function NewScenarioPage() {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        slug: '',
        title: '',
        description: '',
        category: 'restaurant_decision_maker',
        difficulty: 3,
        duration: '10-15 min',
        icon: '💬',
        skills: '',
        start_node_id: 'node-1',
        nodesJSON: '{}'
    });

    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!loading && (!user || !isAdmin)) {
            router.push('/');
        }
    }, [user, loading, isAdmin, router]);

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

            const { data, error: insertError } = await supabase
                .from('scenarios')
                .insert({
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
                    is_active: true
                });

            if (insertError) throw insertError;

            router.push('/admin/scenarios');
        } catch (err) {
            console.error('Error saving scenario:', err);
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const loadTemplate = () => {
        const template = {
            "node-1": {
                "id": "node-1",
                "type": "dialogue",
                "speaker": "system",
                "content": "Você discou para o cliente...",
                "nextNodeId": "node-2"
            },
            "node-2": {
                "id": "node-2",
                "type": "objection_slot",
                "difficultyFilter": 3,
                "nextNodeId": "node-end"
            },
            "node-end": {
                "id": "node-end",
                "type": "end",
                "result": "success",
                "content": "🎉 Parabéns! Você concluiu o desafio."
            }
        };
        setFormData(prev => ({ ...prev, nodesJSON: JSON.stringify(template, null, 2) }));
    };

    if (loading || !user || !isAdmin) return null;

    return (
        <>
            <Navbar />
            <div className={styles.pageWrapper}>
                <Sidebar />
                <main className={styles.mainContent}>
                    <div className={styles.pageHeader}>
                        <div>
                            <h1 className={styles.pageTitle}>🆕 Novo Cenário</h1>
                            <p className={styles.pageDescription}>Crie um novo desafio de roleplay.</p>
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
                                        placeholder="ex: restaurante-novos"
                                        value={formData.slug}
                                        onChange={handleChange}
                                        required
                                    />
                                    <Input
                                        label="Título"
                                        name="title"
                                        placeholder="Título do Cenário"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <Input
                                    label="Descrição"
                                    name="description"
                                    placeholder="Breve descrição"
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
                                        placeholder="Emoji ou classe"
                                        value={formData.icon}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <Input
                                        label="Habilidades (separadas por vírgula)"
                                        name="skills"
                                        placeholder="Estratégia, Tom, Diagnóstico"
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
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                                        <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Nós do Cenário (JSON)</label>
                                        <Button type="button" variant="ghost" size="sm" onClick={loadTemplate}>Carregar Template</Button>
                                    </div>
                                    <textarea
                                        name="nodesJSON"
                                        value={formData.nodesJSON}
                                        onChange={handleChange}
                                        style={{
                                            width: '100%',
                                            height: '300px',
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
                                    {isSaving ? 'Salvando...' : 'Salvar Cenário'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div style={{ marginTop: '40px' }}>
                        <h3>📖 Guia rápido de Nodes</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '10px' }}>
                            <Card>
                                <CardContent>
                                    <strong>Objeção Dinâmica:</strong>
                                    <pre style={{ fontSize: '0.8rem', opacity: 0.7 }}>{`{
  "id": "objection-1",
  "type": "objection_slot",
  "difficultyFilter": 3,
  "nextNodeId": "next-node"
}`}</pre>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent>
                                    <strong>Objeção Fixa (NOVO):</strong>
                                    <pre style={{ fontSize: '0.8rem', opacity: 0.7 }}>{`{
  "id": "objection-1",
  "type": "objection_slot",
  "fixedObjectionId": "model-groupon",
  "nextNodeId": "next-node"
}`}</pre>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
