'use client';

import styles from './LeadProfilePanel.module.css';
import Badge from '@/components/ui/Badge';

export default function LeadProfilePanel({ profile, isVisible, onClose }) {
    if (!profile || !isVisible) return null;

    const { businessProfile, decisionMaker, businessPatterns, marketContext, pastExperiences, interestTriggers } = profile;

    return (
        <div className={styles.panel}>
            <div className={styles.header}>
                <h3>📋 Perfil do Lead</h3>
                <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar painel">
                    ✕
                </button>
            </div>

            <div className={styles.content}>
                {/* Seção: Quem é */}
                <section className={styles.section}>
                    <h4 className={styles.sectionTitle}>👤 Quem é</h4>
                    <div className={styles.card}>
                        <p className={styles.name}>{decisionMaker.name}</p>
                        <p className={styles.role}>{decisionMaker.role}, {decisionMaker.age} anos</p>
                        <div className={styles.badges}>
                            <Badge variant="secondary">{businessProfile.location.city}</Badge>
                            <Badge variant="secondary">{businessProfile.location.neighborhood}</Badge>
                        </div>
                        <p className={styles.personality}>
                            {decisionMaker.personality.slice(0, 2).join(' • ')}
                        </p>
                    </div>
                </section>

                {/* Seção: Negócio */}
                <section className={styles.section}>
                    <h4 className={styles.sectionTitle}>🏢 Negócio</h4>
                    <div className={styles.card}>
                        <p className={styles.businessName}>{businessProfile.name}</p>
                        <p className={styles.businessType}>{businessProfile.type}</p>
                        <div className={styles.metrics}>
                            <div className={styles.metric}>
                                <span className={styles.metricLabel}>Faturamento</span>
                                <span className={styles.metricValue}>{businessProfile.monthlyRevenue}</span>
                            </div>
                            <div className={styles.metric}>
                                <span className={styles.metricLabel}>Ticket Médio</span>
                                <span className={styles.metricValue}>{businessProfile.avgTicket}</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Seção: Desafios */}
                <section className={styles.section}>
                    <h4 className={styles.sectionTitle}>📊 Desafios Atuais</h4>
                    <div className={styles.card}>
                        <ul className={styles.list}>
                            {marketContext.currentChallenges.slice(0, 3).map((challenge, i) => (
                                <li key={i} className={styles.listItem}>{challenge}</li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* Seção: Frustrações */}
                <section className={styles.section}>
                    <h4 className={styles.sectionTitle}>😤 Experiências Ruins</h4>
                    <div className={styles.card}>
                        {pastExperiences.frustrations.map((frustration, i) => (
                            <div key={i} className={styles.frustration}>
                                <strong>{frustration.what}</strong>
                                <p>{frustration.result}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Seção: Gatilhos (Expansível) */}
                <details className={styles.details}>
                    <summary className={styles.summary}>💡 Gatilhos de Interesse</summary>
                    <div className={styles.triggers}>
                        <div className={styles.triggerSection}>
                            <h5 className={styles.triggerTitle}>✓ O que funciona</h5>
                            <ul className={styles.list}>
                                {interestTriggers.positive.slice(0, 3).map((trigger, i) => (
                                    <li key={i} className={styles.triggerItem}>{trigger}</li>
                                ))}
                            </ul>
                        </div>
                        <div className={styles.triggerSection}>
                            <h5 className={styles.triggerTitle}>✗ O que evitar</h5>
                            <ul className={styles.list}>
                                {interestTriggers.negative.slice(0, 3).map((trigger, i) => (
                                    <li key={i} className={styles.triggerItem}>{trigger}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </details>

                {/* Seção: Padrões de Negócio (Expansível) */}
                <details className={styles.details}>
                    <summary className={styles.summary}>📅 Padrões Operacionais</summary>
                    <div className={styles.card}>
                        <div className={styles.patterns}>
                            <div>
                                <strong>Dias fortes:</strong>
                                <p>{businessPatterns.strongDays.join(', ')}</p>
                            </div>
                            <div>
                                <strong>Dias fracos:</strong>
                                <p>{businessPatterns.weakDays.join(', ')}</p>
                            </div>
                        </div>
                    </div>
                </details>
            </div>
        </div>
    );
}
