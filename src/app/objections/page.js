'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import styles from './page.module.css';

const OBJECTIONS_DATA = [
    {
        id: 1,
        objection: 'Já trabalho com outra plataforma de cupons',
        category: 'Concorrência',
        response1: 'Entendo! O diferencial da Voppi está nos creators e na curadoria. Não é só desconto, é divulgação premium com conteúdo de qualidade.',
        response2: 'Faz sentido ter mais de um canal! A Voppi atrai um público diferente - pessoas que buscam experiências, não só preço.',
        strategicObjective: 'Diferenciar a proposta de valor e não competir diretamente por preço',
    },
    {
        id: 2,
        objection: 'É muito caro o setup inicial',
        category: 'Preço',
        response1: 'Posso detalhar o que está incluso? Só o cardápio digital no mercado custa R$300, o pack de artes R$200, o diagnóstico comercial mais de R$500. Você recebe tudo isso junto.',
        response2: 'Entendo a preocupação com investimento. A boa notícia é que você só paga comissão quando vende - o risco é muito baixo.',
        strategicObjective: 'Ancorar no valor das entregas e reduzir percepção de risco',
    },
    {
        id: 3,
        objection: 'Tentei Groupon e só veio cliente caça-promoção',
        category: 'Experiência anterior',
        response1: 'Essa é uma preocupação muito válida. Por isso a Voppi faz curadoria forte - atraímos pessoas que buscam experiências, não só o menor preço.',
        response2: 'O modelo Voppi é diferente: você só paga após o atendimento. Se o cliente não for, não tem custo. E trabalhamos com creators que trazem um público mais qualificado.',
        strategicObjective: 'Validar a dor, diferenciar do modelo tradicional, reduzir risco percebido',
    },
    {
        id: 4,
        objection: 'Não tenho tempo pra mais uma coisa',
        category: 'Objeção de tempo',
        response1: 'Justamente por isso a gente cuida de tudo: criamos o material, fazemos a divulgação, gerenciamos os vouchers. Sua única ação é atender bem os clientes.',
        response2: 'Entendo que tempo é precioso. A parceria Voppi foi desenhada pra dar trabalho mínimo pra você. A gente faz o setup todo.',
        strategicObjective: 'Mostrar que a Voppi resolve, não cria trabalho',
    },
    {
        id: 5,
        objection: 'Preciso pensar / Vou analisar',
        category: 'Adiamento',
        response1: 'Claro! O que especificamente você gostaria de avaliar melhor? Posso ajudar a esclarecer agora mesmo.',
        response2: 'Faz sentido! Que tal a gente marcar uma call rápida pra próxima semana? Assim você tem tempo de pensar e eu tiro qualquer dúvida que surgir.',
        strategicObjective: 'Não deixar o lead esfriar, identificar objeção real, manter próximo passo definido',
    },
    {
        id: 6,
        objection: 'Meu restaurante/parque não precisa de divulgação',
        category: 'Negação de necessidade',
        response1: 'É ótimo estar bem posicionado! Mas a Voppi ajuda a manter esse posicionamento e atrair clientes em épocas mais fracas. Como está a ocupação nos dias de semana?',
        response2: 'Que bom! Nesse caso, a parceria pode ajudar a maximizar seu ticket médio, trazendo clientes que já valorizam qualidade.',
        strategicObjective: 'Fazer diagnóstico para encontrar uma dor real, não contradizer o cliente',
    },
    {
        id: 7,
        objection: 'Nunca ouvi falar da Voppi',
        category: 'Desconhecimento',
        response1: 'A Voppi está crescendo forte! Temos mais de 150 mil seguidores no Instagram e trabalhamos com mais de 100 creators. Posso mandar nosso perfil pra você conhecer?',
        response2: 'Normal, estamos expandindo agora! Mas já temos cases incríveis com [mencionar estabelecimentos similares]. Posso compartilhar alguns resultados?',
        strategicObjective: 'Construir credibilidade com números e social proof',
    },
    {
        id: 8,
        objection: 'O dono não está disponível agora',
        category: 'Gatekeeper',
        response1: 'Entendo! Qual seria o melhor horário para encontrá-lo? E qual o nome dele para eu perguntar diretamente na próxima vez?',
        response2: 'Sem problema! Posso deixar uma mensagem importante pra ele: a Voppi tem uma proposta de parceria com divulgação por creators. Ele pode me retornar neste número.',
        strategicObjective: 'Coletar informações úteis e deixar caminho aberto para retorno',
    },
];

export default function ObjectionsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loader}></div>
                <p>Carregando...</p>
            </div>
        );
    }

    const categories = [...new Set(OBJECTIONS_DATA.map(o => o.category))];

    const filteredObjections = OBJECTIONS_DATA.filter(obj => {
        const matchesSearch = obj.objection.toLowerCase().includes(searchTerm.toLowerCase()) ||
            obj.response1.toLowerCase().includes(searchTerm.toLowerCase()) ||
            obj.response2.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || obj.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <>
            <Navbar />
            <div className={styles.pageWrapper}>
                <Sidebar />
                <main className={styles.mainContent}>
                    <div className={styles.pageHeader}>
                        <h1 className={styles.pageTitle}>💬 Biblioteca de Objeções</h1>
                        <p className={styles.pageDescription}>
                            Domine as respostas para as objeções mais comuns. Cada uma com raciocínio estratégico.
                        </p>
                    </div>

                    <div className={styles.filters}>
                        <Input
                            placeholder="Buscar objeção ou resposta..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                        <div className={styles.categoryFilters}>
                            <Button
                                variant={selectedCategory === '' ? 'primary' : 'ghost'}
                                size="sm"
                                onClick={() => setSelectedCategory('')}
                            >
                                Todas
                            </Button>
                            {categories.map(cat => (
                                <Button
                                    key={cat}
                                    variant={selectedCategory === cat ? 'primary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setSelectedCategory(cat)}
                                >
                                    {cat}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.objectionsList}>
                        {filteredObjections.map((obj) => (
                            <Card
                                key={obj.id}
                                className={`${styles.objectionCard} ${expandedId === obj.id ? styles.expanded : ''}`}
                                hoverable
                                onClick={() => setExpandedId(expandedId === obj.id ? null : obj.id)}
                            >
                                <CardContent>
                                    <div className={styles.objectionHeader}>
                                        <Badge variant="secondary" size="sm">{obj.category}</Badge>
                                        <span className={styles.expandIcon}>{expandedId === obj.id ? '−' : '+'}</span>
                                    </div>
                                    <h3 className={styles.objectionText}>"{obj.objection}"</h3>

                                    {expandedId === obj.id && (
                                        <div className={styles.objectionDetails}>
                                            <div className={styles.responseSection}>
                                                <div className={styles.responseCard}>
                                                    <div className={styles.responseLabel}>
                                                        <span className={styles.responseIcon}>💡</span>
                                                        Resposta Sugerida 1
                                                    </div>
                                                    <p>{obj.response1}</p>
                                                </div>
                                                <div className={styles.responseCard}>
                                                    <div className={styles.responseLabel}>
                                                        <span className={styles.responseIcon}>💡</span>
                                                        Resposta Sugerida 2
                                                    </div>
                                                    <p>{obj.response2}</p>
                                                </div>
                                            </div>
                                            <div className={styles.strategicBox}>
                                                <strong>🎯 Objetivo Estratégico:</strong>
                                                <p>{obj.strategicObjective}</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {filteredObjections.length === 0 && (
                        <div className={styles.emptyState}>
                            <span className={styles.emptyIcon}>🔍</span>
                            <p>Nenhuma objeção encontrada para sua busca.</p>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
