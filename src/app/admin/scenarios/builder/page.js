'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { generateScenarioStructure } from '@/lib/aiGenerator';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import styles from './page.module.css';

const STEPS = [
    { id: 1, title: 'Dados Básicos' },
    { id: 2, title: 'Persona da IA' },
    { id: 3, title: 'Editor de Nós' },
    { id: 4, title: 'Revisão' }
];

export default function ScenarioBuilderPage() {
    const { user, profile, loading } = useAuth();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);

    // AI Magic State
    const [showMagicModal, setShowMagicModal] = useState(false);
    const [magicTopic, setMagicTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Form State
    const [metadata, setMetadata] = useState({
        title: '',
        description: '',
        category: 'general',
        difficulty: 1,
        icon: '🎯',
        minLevel: 1,
        duration: '10-15 min'
    });

    const [persona, setPersona] = useState({
        name: 'Lead Padrão',
        role: 'Proprietário',
        tone: 'Cético e ocupado',
        businessType: 'Restaurante',
        objections: '', // comma separated manually or via tags
        successCriteria: ''
    });

    const [nodes, setNodes] = useState([
        {
            id: 'start',
            type: 'npc',
            text: 'Olá! Sou o dono. O que você deseja?',
            options: []
        }
    ]);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
        if (profile && profile.role !== 'admin') {
            router.push('/');
        }
    }, [user, profile, loading, router]);

    const handleNext = () => {
        if (currentStep < 4) setCurrentStep(curr => curr + 1);
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(curr => curr - 1);
    };

    const handleMagicFill = async () => {
        if (!magicTopic) return;
        setIsGenerating(true);
        try {
            const generated = await generateScenarioStructure(magicTopic, metadata.difficulty === 1 ? 'easy' : 'normal');

            // Populate State
            if (generated.metadata) {
                setMetadata(prev => ({ ...prev, ...generated.metadata }));
            }
            if (generated.persona) {
                setPersona(prev => ({ ...prev, ...generated.persona }));
            }
            if (generated.nodes && Array.isArray(generated.nodes)) {
                setNodes(generated.nodes);
            }

            setShowMagicModal(false);
            alert('✨ Cenário gerado com sucesso! Revise os dados.');
        } catch (err) {
            console.error('Magic Fill Error:', err);
            alert('Erro ao gerar cenário. Tente novamente.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async () => {
        // Build final JSON payload
        const scenarioPayload = {
            slug: metadata.title.toLowerCase().replace(/\s+/g, '-'),
            title: metadata.title,
            description: metadata.description,
            category: metadata.category,
            difficulty: parseInt(metadata.difficulty),
            duration: metadata.duration,
            icon: metadata.icon,
            min_level: parseInt(metadata.minLevel),
            nodes: { nodes }, // Wrap in object as existing structure expects
            start_node_id: 'start',
            is_active: false, // Default to inactive
        };

        try {
            const { data, error } = await supabase
                .from('scenarios')
                .insert(scenarioPayload)
                .select();

            if (error) throw error;
            router.push('/admin/scenarios');
        } catch (err) {
            console.error('Error saving scenario:', err);
            alert('Erro ao salvar cenário. Verifique o console.');
        }
    };

    if (loading || !profile) return <div className={styles.loading}>Carregando...</div>;

    return (
        <>
            <Navbar />
            <div className={styles.pageWrapper}>
                <Sidebar />
                <main className={styles.mainContent}>
                    <div className={styles.pageHeader}>
                        <div>
                            <h1 className={styles.pageTitle}>🏗️ Construtor de Cenários</h1>
                            <p className={styles.pageDescription}>Crie novos roleplays sem digitar uma linha de código.</p>
                        </div>
                        <div className={styles.steps}>
                            {STEPS.map(step => (
                                <div
                                    key={step.id}
                                    className={`${styles.stepItem} ${currentStep === step.id ? styles.active : ''} ${currentStep > step.id ? styles.completed : ''}`}
                                >
                                    <div className={styles.stepCircle}>{step.id}</div>
                                    <span>{step.title}</span>
                                </div>
                            ))}
                            <Button
                                variant="outline"
                                style={{ marginLeft: '1rem', borderColor: '#8b5cf6', color: '#8b5cf6' }}
                                onClick={() => setShowMagicModal(true)}
                            >
                                ✨ Magic Fill
                            </Button>
                        </div>
                    </div>

                    <div className={styles.contentArea}>
                        {/* STEP 1: METADATA */}
                        {currentStep === 1 && (
                            <Card>
                                <CardHeader><CardTitle>Informações do Cenário</CardTitle></CardHeader>
                                <CardContent className={styles.formGrid}>
                                    <div className={styles.fieldGroup}>
                                        <label>Título do Cenário</label>
                                        <Input
                                            value={metadata.title}
                                            onChange={e => setMetadata({ ...metadata, title: e.target.value })}
                                            placeholder="Ex: Venda para Academias"
                                        />
                                    </div>
                                    <div className={styles.fieldGroup}>
                                        <label>Descrição Curta</label>
                                        <textarea
                                            className={styles.textarea}
                                            value={metadata.description}
                                            onChange={e => setMetadata({ ...metadata, description: e.target.value })}
                                            placeholder="O que o aluno vai aprender neste cenário?"
                                        />
                                    </div>
                                    <div className={styles.row}>
                                        <div className={styles.fieldGroup}>
                                            <label>Dificuldade (1-5)</label>
                                            <Input
                                                type="number" min="1" max="5"
                                                value={metadata.difficulty}
                                                onChange={e => setMetadata({ ...metadata, difficulty: e.target.value })}
                                            />
                                        </div>
                                        <div className={styles.fieldGroup}>
                                            <label>Nível Mínimo</label>
                                            <Input
                                                type="number" min="1"
                                                value={metadata.minLevel}
                                                onChange={e => setMetadata({ ...metadata, minLevel: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.row}>
                                        <div className={styles.fieldGroup}>
                                            <label>Categoria (ID)</label>
                                            <Input
                                                value={metadata.category}
                                                onChange={e => setMetadata({ ...metadata, category: e.target.value })}
                                                placeholder="Ex: restaurant, gym, office"
                                            />
                                        </div>
                                        <div className={styles.fieldGroup}>
                                            <label>Ícone (Emoji)</label>
                                            <Input
                                                value={metadata.icon}
                                                onChange={e => setMetadata({ ...metadata, icon: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* STEP 2: PERSONA */}
                        {currentStep === 2 && (
                            <Card>
                                <CardHeader><CardTitle>Definição da Persona (IA)</CardTitle></CardHeader>
                                <CardContent className={styles.formGrid}>
                                    <div className={styles.row}>
                                        <div className={styles.fieldGroup}>
                                            <label>Nome do Lead</label>
                                            <Input
                                                value={persona.name}
                                                onChange={e => setPersona({ ...persona, name: e.target.value })}
                                            />
                                        </div>
                                        <div className={styles.fieldGroup}>
                                            <label>Cargo/Papel</label>
                                            <Input
                                                value={persona.role}
                                                onChange={e => setPersona({ ...persona, role: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.fieldGroup}>
                                        <label>Tom de Voz e Comportamento</label>
                                        <textarea
                                            className={styles.textarea}
                                            value={persona.tone}
                                            onChange={e => setPersona({ ...persona, tone: e.target.value })}
                                            placeholder="Ex: Impaciente, preocupado com custos, mas aberto a inovação..."
                                        />
                                    </div>
                                    <div className={styles.fieldGroup}>
                                        <label>Principais Objeções (Separadas por vírgula)</label>
                                        <Input
                                            value={persona.objections}
                                            onChange={e => setPersona({ ...persona, objections: e.target.value })}
                                            placeholder="Ex: Preço alto, já tenho fornecedor, não tenho tempo"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* STEP 3: NODE EDITOR */}
                        {currentStep === 3 && (
                            <div className={styles.editorContainer}>
                                <div className={styles.nodeList}>
                                    {nodes.map((node, index) => (
                                        <Card key={node.id} className={styles.nodeCard}>
                                            <CardHeader className={styles.nodeHeader}>
                                                <div className={styles.nodeTitle}>
                                                    <Badge variant={node.type === 'npc' ? 'primary' : 'secondary'}>
                                                        {node.type === 'npc' ? '🤖 NPC (IA)' : '👤 Jogador'}
                                                    </Badge>
                                                    <span className={styles.nodeId}>#{node.id}</span>
                                                </div>
                                                {node.id !== 'start' && (
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => {
                                                            setNodes(nodes.filter(n => n.id !== node.id));
                                                        }}
                                                    >
                                                        🗑️
                                                    </Button>
                                                )}
                                            </CardHeader>
                                            <CardContent>
                                                <div className={styles.fieldGroup}>
                                                    <label>Texto / Fala</label>
                                                    <textarea
                                                        className={styles.textarea}
                                                        value={node.text}
                                                        onChange={e => {
                                                            const newNodes = [...nodes];
                                                            newNodes[index].text = e.target.value;
                                                            setNodes(newNodes);
                                                        }}
                                                        placeholder="O que será dito aqui?"
                                                    />
                                                </div>

                                                {/* Options for NPC nodes (Player choices) */}
                                                {node.type === 'npc' && (
                                                    <div className={styles.optionsSection}>
                                                        <label>Opções de Resposta do Jogador:</label>
                                                        {node.options && node.options.map((opt, optIndex) => (
                                                            <div key={optIndex} className={styles.optionRow}>
                                                                <Input
                                                                    value={opt.label}
                                                                    onChange={e => {
                                                                        const newNodes = [...nodes];
                                                                        newNodes[index].options[optIndex].label = e.target.value;
                                                                        setNodes(newNodes);
                                                                    }}
                                                                    placeholder="Texto da opção..."
                                                                />
                                                                <select
                                                                    className={styles.select}
                                                                    value={opt.nextId || ''}
                                                                    onChange={e => {
                                                                        const newNodes = [...nodes];
                                                                        newNodes[index].options[optIndex].nextId = e.target.value;
                                                                        setNodes(newNodes);
                                                                    }}
                                                                >
                                                                    <option value="">Ir para...</option>
                                                                    {nodes.map(n => (
                                                                        <option key={n.id} value={n.id}>
                                                                            #{n.id} - {n.text.substring(0, 20)}...
                                                                        </option>
                                                                    ))}
                                                                    <option value="success">[FIM] Sucesso</option>
                                                                    <option value="failure">[FIM] Falha</option>
                                                                </select>
                                                                <Button
                                                                    variant="danger"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        const newNodes = [...nodes];
                                                                        newNodes[index].options = newNodes[index].options.filter((_, i) => i !== optIndex);
                                                                        setNodes(newNodes);
                                                                    }}
                                                                >
                                                                    X
                                                                </Button>
                                                            </div>
                                                        ))}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                const newNodes = [...nodes];
                                                                if (!newNodes[index].options) newNodes[index].options = [];
                                                                newNodes[index].options.push({ label: '', nextId: '', feedback: '' });
                                                                setNodes(newNodes);
                                                            }}
                                                        >
                                                            + Adicionar Opção
                                                        </Button>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                <div className={styles.editorSidebar}>
                                    <Button
                                        variant="primary"
                                        fullWidth
                                        onClick={() => {
                                            const newId = `node_${nodes.length + 1}`;
                                            setNodes([...nodes, {
                                                id: newId,
                                                type: 'npc',
                                                text: '',
                                                options: []
                                            }]);
                                        }}
                                    >
                                        + Novo Nó (NPC)
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* STEP 4: PREVIEW */}
                        {currentStep === 4 && (
                            <Card>
                                <CardHeader><CardTitle>Revisão do Cenário</CardTitle></CardHeader>
                                <CardContent>
                                    <div className={styles.previewStats}>
                                        <div className={styles.stat}>
                                            <strong>Título:</strong> {metadata.title}
                                        </div>
                                        <div className={styles.stat}>
                                            <strong>Nós Totais:</strong> {nodes.length}
                                        </div>
                                        <div className={styles.stat}>
                                            <strong>Persona:</strong> {persona.name} ({persona.role})
                                        </div>
                                    </div>
                                    <div className={styles.jsonPreview}>
                                        <pre>{JSON.stringify({ metadata, persona, nodes }, null, 2)}</pre>
                                    </div>
                                    <p className={styles.warning}>
                                        ⚠️ Ao salvar, este cenário ficará inativo até ser ativado no painel.
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        <div className={styles.actions}>
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                disabled={currentStep === 1}
                            >
                                Voltar
                            </Button>
                            {currentStep < 4 ? (
                                <Button variant="primary" onClick={handleNext}>
                                    Próximo
                                </Button>
                            ) : (
                                <Button variant="success" onClick={handleSave}>
                                    Salvar Cenário
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Magic Modal */}
                    {showMagicModal && (
                        <div className={styles.modalOverlay}>
                            <div className={styles.modalContent}>
                                <h2>✨ Magic Fill (IA)</h2>
                                <p>Descreva o cenário que você quer criar e a IA vai gerar a estrutura completa para você.</p>
                                <textarea
                                    className={styles.textarea}
                                    placeholder="Ex: Venda de Plano Odontológico para um cliente que acha caro..."
                                    value={magicTopic}
                                    onChange={(e) => setMagicTopic(e.target.value)}
                                    rows={4}
                                />
                                <div className={styles.modalActions}>
                                    <Button variant="outline" onClick={() => setShowMagicModal(false)} disabled={isGenerating}>Cancelar</Button>
                                    <Button variant="primary" onClick={handleMagicFill} disabled={isGenerating || !magicTopic}>
                                        {isGenerating ? 'Gerando...' : 'Gerar Cenário'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
