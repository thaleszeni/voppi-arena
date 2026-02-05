'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import styles from './page.module.css';
import Link from 'next/link';

const MOCK_SCENARIOS = [
  {
    id: 1,
    title: 'Restaurante Grande - Decisor',
    description: 'Abordagem direta ao proprietário de um restaurante de grande porte',
    category: 'restaurant_decision_maker',
    difficulty: 3,
    icon: '🍽️',
  },
  {
    id: 2,
    title: 'Restaurante - Gatekeeper',
    description: 'Estratégia para passar pelo funcionário e chegar ao decisor',
    category: 'restaurant_gatekeeper',
    difficulty: 2,
    icon: '🚪',
  },
  {
    id: 3,
    title: 'Parque / Atração Turística',
    description: 'Abordagem B2B para parques e atrações de grande volume',
    category: 'park',
    difficulty: 4,
    icon: '🎢',
  },
];


export default function HomePage() {
  const { user, profile, loading } = useAuth();
  const [topUsers, setTopUsers] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchTopUsers() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('users')
          .select('full_name, total_points, level')
          .order('total_points', { ascending: false })
          .limit(5);

        if (!error) {
          setTopUsers(data.map((p, i) => ({
            rank: i + 1,
            name: p.full_name,
            points: p.total_points || 0,
            level: p.level || 1
          })));
        }
      } catch (err) {
        console.error('Error fetching top users:', err);
      }
    }
    fetchTopUsers();
  }, [user]);

  if (loading || !user) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className={styles.pageWrapper}>
        <Sidebar />
        <main className={styles.mainContent}>
          {/* Hero Section */}
          <section className={styles.hero}>
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>
                Olá, {profile?.full_name?.split(' ')[0] || 'Comercial'}! 👋
              </h1>
              <p className={styles.heroSubtitle}>
                Pronto para mais um treino? Escolha um cenário e domine a arte da venda!
              </p>
            </div>
            <div className={styles.heroVisual}>
              <div className={styles.heroCard}>
                <div className={styles.heroCardIcon}>🎯</div>
                <span>Roleplay Interativo</span>
              </div>
              <div className={styles.heroCard}>
                <div className={styles.heroCardIcon}>🏆</div>
                <span>Gamificação</span>
              </div>
              <div className={styles.heroCard}>
                <div className={styles.heroCardIcon}>📈</div>
                <span>Evolução Real</span>
              </div>
            </div>
          </section>

          {/* Quick Stats */}
          <section className={styles.statsSection}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🎯</div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{profile?.total_points || 0}</span>
                <span className={styles.statLabel}>Pontos Totais</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>⭐</div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>N{profile?.level || 1}</span>
                <span className={styles.statLabel}>Seu Nível</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🏅</div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>3</span>
                <span className={styles.statLabel}>Badges</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📊</div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>#1</span>
                <span className={styles.statLabel}>Ranking</span>
              </div>
            </div>
          </section>

          {/* Scenarios Section */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>🎬 Cenários Disponíveis</h2>
              <Link href="/roleplay" className={styles.sectionLink}>Ver todos →</Link>
            </div>
            <div className={styles.scenariosGrid}>
              {MOCK_SCENARIOS.map((scenario) => (
                <Link
                  key={scenario.id}
                  href={user ? `/roleplay/${scenario.id}` : '/login'}
                  className={styles.scenarioCard}
                >
                  <div className={styles.scenarioIcon}>{scenario.icon}</div>
                  <div className={styles.scenarioContent}>
                    <h3 className={styles.scenarioTitle}>{scenario.title}</h3>
                    <p className={styles.scenarioDescription}>{scenario.description}</p>
                    <div className={styles.scenarioMeta}>
                      <span className={styles.scenarioDifficulty}>
                        {'⭐'.repeat(scenario.difficulty)}
                      </span>
                      <span className={styles.scenarioCta}>Iniciar →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Leaderboard Section */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>🏆 Top Comerciais</h2>
              <Link href="/ranking" className={styles.sectionLink}>Ver ranking completo →</Link>
            </div>
            <div className={styles.leaderboard}>
              {topUsers.length > 0 ? (
                topUsers.map((player) => (
                  <div key={player.rank} className={styles.leaderboardItem}>
                    <span className={`${styles.leaderboardRank} ${styles[`rank${player.rank}`]}`}>
                      {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : `#${player.rank}`}
                    </span>
                    <div className={styles.leaderboardInfo}>
                      <span className={styles.leaderboardName}>{player.name}</span>
                      <span className={styles.leaderboardLevel}>Nível {player.level}</span>
                    </div>
                    <span className={styles.leaderboardPoints}>{player.points.toLocaleString()} pts</span>
                  </div>
                ))
              ) : (
                <p className={styles.emptyRanking}>Nenhum comercial ranqueado ainda.</p>
              )}
            </div>
          </section>

          {/* Features Section - for non-logged users */}
          {!user && (
            <section className={styles.featuresSection}>
              <h2 className={styles.sectionTitle}>Por que treinar na Arena?</h2>
              <div className={styles.featuresGrid}>
                <div className={styles.featureCard}>
                  <div className={styles.featureIcon}>🎯</div>
                  <h3>Roleplay Realista</h3>
                  <p>Simulações baseadas em cenários reais de vendas Voppi</p>
                </div>
                <div className={styles.featureCard}>
                  <div className={styles.featureIcon}>💬</div>
                  <h3>Contorno de Objeções</h3>
                  <p>Biblioteca completa com respostas estratégicas</p>
                </div>
                <div className={styles.featureCard}>
                  <div className={styles.featureIcon}>📊</div>
                  <h3>Feedback Instantâneo</h3>
                  <p>Aprenda em tempo real com cada decisão</p>
                </div>
                <div className={styles.featureCard}>
                  <div className={styles.featureIcon}>🏆</div>
                  <h3>Gamificação</h3>
                  <p>Níveis, badges e ranking para motivar seu crescimento</p>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  );
}
