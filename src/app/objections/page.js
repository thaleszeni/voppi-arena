'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Card, { CardContent } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { OBJECTIONS_DATA } from '@/lib/objections';
import styles from './page.module.css';

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
                                        <div className={styles.objectionTitleRow}>
                                            <h3 className={styles.objectionText}>"{obj.objection}"</h3>
                                            <div className={styles.difficultyBadge}>
                                                {Array.from({ length: obj.difficulty }).map((_, i) => '🔥')}
                                            </div>
                                        </div>
                                        <span className={styles.expandIcon}>{expandedId === obj.id ? '−' : '+'}</span>
                                    </div>

                                    {expandedId === obj.id && (
                                        <div className={styles.objectionDetails}>
                                            <div className={styles.responseSection}>
                                                <div className={styles.responseCard}>
                                                    <div className={styles.responseLabel}>
                                                        <span className={styles.responseIcon}>💡</span>
                                                        Resposta Direta
                                                    </div>
                                                    <p>{obj.response1}</p>
                                                </div>
                                                <div className={styles.responseCard}>
                                                    <div className={styles.responseLabel}>
                                                        <span className={styles.responseIcon}>🧠</span>
                                                        Resposta Estratégica
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
