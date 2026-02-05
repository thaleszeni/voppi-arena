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

export default function AdminManualPage() {
    const { user, loading, isAdmin } = useAuth();
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
                        <Link href="/admin" className={styles.backLink}>
                            ← Voltar ao Painel
                        </Link>
                        <h1 className={styles.pageTitle}>📖 Manual do Admin</h1>
                        <p className={styles.pageDescription}>
                            Guia completo para gerenciar a Arena de Roleplay Voppi
                        </p>
                    </div>

                    <div className={styles.manualContent}>
                        {/* Visão Geral */}
                        <Card className={styles.manualSection}>
                            <CardHeader>
                                <CardTitle>🎯 Visão Geral da Plataforma</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>
                                    A <strong>Arena de Roleplay Voppi</strong> é uma plataforma de treinamento comercial
                                    gamificada. Os colaboradores aprendem através de simulações interativas de ligações
                                    de vendas, praticando abertura, diagnóstico, contorno de objeções e fechamento.
                                </p>
                                <br />
                                <h4>Principais elementos:</h4>
                                <ul className={styles.manualList}>
                                    <li><strong>Cenários de Roleplay:</strong> Simulações interativas com pontuação</li>
                                    <li><strong>Biblioteca de Objeções:</strong> Respostas prontas para situações comuns</li>
                                    <li><strong>Sistema de Pontos:</strong> Gamificação que motiva o aprendizado</li>
                                    <li><strong>Ranking:</strong> Competição saudável entre o time</li>
                                    <li><strong>Níveis:</strong> Progressão do N1 (Abertura) ao N5 (Fechamento)</li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Gerenciando Cenários */}
                        <Card className={styles.manualSection}>
                            <CardHeader>
                                <CardTitle>🎬 Gerenciando Cenários</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>
                                    Cenários são o coração da plataforma. Cada cenário simula uma ligação de vendas
                                    com diferentes caminhos baseados nas escolhas do usuário.
                                </p>
                                <br />
                                <h4>Estrutura de um cenário:</h4>
                                <ul className={styles.manualList}>
                                    <li><strong>Nós de Diálogo:</strong> Falas do sistema ou do cliente</li>
                                    <li><strong>Nós de Escolha:</strong> Opções de resposta para o usuário</li>
                                    <li><strong>Nós de Fim:</strong> Conclusão com resultado (sucesso/parcial/falha)</li>
                                </ul>
                                <br />
                                <h4>Critérios de pontuação:</h4>
                                <ul className={styles.manualList}>
                                    <li><strong>Estratégia (🎯):</strong> Alinhamento com melhor prática comercial</li>
                                    <li><strong>Clareza (💡):</strong> Comunicação clara e objetiva</li>
                                    <li><strong>Tom (🗣️):</strong> Adequação ao contexto e rapport</li>
                                    <li><strong>Diagnóstico (🔍):</strong> Identificação de dores e necessidades</li>
                                    <li><strong>Fechamento (🤝):</strong> Condução para próximo passo</li>
                                </ul>
                                <br />
                                <p className={styles.tip}>
                                    💡 <strong>Dica:</strong> Cada escolha deve ter entre 0-100 pontos por critério.
                                    A melhor escolha geralmente tem 80-95 em cada, a média 50-70, e a ruim 20-40.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Biblioteca de Objeções */}
                        <Card className={styles.manualSection}>
                            <CardHeader>
                                <CardTitle>💬 Biblioteca de Objeções</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>
                                    A biblioteca de objeções serve como referência rápida para os comerciais.
                                    Cada objeção deve ter:
                                </p>
                                <ul className={styles.manualList}>
                                    <li><strong>Objeção:</strong> A frase exata que o cliente diz</li>
                                    <li><strong>Categoria:</strong> Agrupamento (Preço, Concorrência, etc)</li>
                                    <li><strong>Respostas sugeridas:</strong> 2-3 formas de contornar</li>
                                    <li><strong>Objetivo estratégico:</strong> O que queremos alcançar</li>
                                </ul>
                                <br />
                                <h4>Categorias padrão:</h4>
                                <ul className={styles.manualList}>
                                    <li>Preço</li>
                                    <li>Concorrência</li>
                                    <li>Experiência anterior</li>
                                    <li>Objeção de tempo</li>
                                    <li>Adiamento</li>
                                    <li>Negação de necessidade</li>
                                    <li>Desconhecimento</li>
                                    <li>Gatekeeper</li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Gerenciando Usuários */}
                        <Card className={styles.manualSection}>
                            <CardHeader>
                                <CardTitle>👥 Gerenciando Usuários</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>
                                    Na área de usuários você pode:
                                </p>
                                <ul className={styles.manualList}>
                                    <li>Ver todos os usuários registrados</li>
                                    <li>Promover usuários a admin</li>
                                    <li>Visualizar estatísticas individuais</li>
                                    <li>Acompanhar progresso de cada pessoa</li>
                                </ul>
                                <br />
                                <h4>Níveis de acesso:</h4>
                                <ul className={styles.manualList}>
                                    <li><strong>user:</strong> Acesso à arena, perfil e ranking</li>
                                    <li><strong>admin:</strong> Acesso completo incluindo painel administrativo</li>
                                </ul>
                                <br />
                                <p className={styles.warning}>
                                    ⚠️ <strong>Importante:</strong> Apenas promova a admin pessoas de confiança
                                    que precisam gerenciar a plataforma.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Desafios Semanais */}
                        <Card className={styles.manualSection}>
                            <CardHeader>
                                <CardTitle>🏆 Desafios Semanais</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>
                                    Desafios semanais incentivam a prática contínua. Configure metas como:
                                </p>
                                <ul className={styles.manualList}>
                                    <li>"Complete X roleplays esta semana"</li>
                                    <li>"Atinja média de Y% no cenário Z"</li>
                                    <li>"Todo time completar o novo cenário"</li>
                                </ul>
                                <br />
                                <h4>Recompensas sugeridas:</h4>
                                <ul className={styles.manualList}>
                                    <li>+50 a +200 XP bônus</li>
                                    <li>Badges especiais</li>
                                    <li>Destaque no ranking</li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Boas Práticas */}
                        <Card className={styles.manualSection}>
                            <CardHeader>
                                <CardTitle>✅ Boas Práticas</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ol className={styles.manualList}>
                                    <li>
                                        <strong>Mantenha cenários atualizados:</strong> Revise mensalmente para refletir
                                        mudanças no pitch ou produto
                                    </li>
                                    <li>
                                        <strong>Adicione objeções reais:</strong> Quando o time encontrar uma nova objeção
                                        no dia-a-dia, adicione à biblioteca
                                    </li>
                                    <li>
                                        <strong>Celebre conquistas:</strong> Reconheça quem lidera o ranking nas reuniões de time
                                    </li>
                                    <li>
                                        <strong>Use feedback dos cenários:</strong> Os feedbacks depois de cada escolha devem
                                        explicar o "porquê", não só dizer se está certo ou errado
                                    </li>
                                    <li>
                                        <strong>Varie dificuldades:</strong> Tenha cenários fáceis para onboarding e
                                        difíceis para comerciais experientes
                                    </li>
                                </ol>
                            </CardContent>
                        </Card>

                        {/* Suporte */}
                        <Card className={styles.manualSection}>
                            <CardHeader>
                                <CardTitle>🆘 Suporte</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>
                                    Para dúvidas técnicas ou sugestões de melhorias:
                                </p>
                                <ul className={styles.manualList}>
                                    <li>Entre em contato com o time de desenvolvimento</li>
                                    <li>Documente bugs encontrados com capturas de tela</li>
                                    <li>Sugira novos cenários baseados em situações reais</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </>
    );
}
