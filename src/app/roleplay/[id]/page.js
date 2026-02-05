'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { getScenario } from '@/lib/scenarios';
import Button from '@/components/ui/Button';
import Card, { CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Progress from '@/components/ui/Progress';
import styles from './page.module.css';

const CRITERIA_LABELS = {
    strategy: 'Estratégia',
    clarity: 'Clareza',
    tone: 'Tom',
    diagnosis: 'Diagnóstico',
    closing: 'Fechamento',
};

const CRITERIA_ICONS = {
    strategy: '🎯',
    clarity: '💡',
    tone: '🗣️',
    diagnosis: '🔍',
    closing: '🤝',
};

export default function RoleplayPlayerPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();

    const scenario = useMemo(() => getScenario(params.id), [params.id]);

    const [currentNodeId, setCurrentNodeId] = useState(null);
    const [history, setHistory] = useState([]);
    const [scores, setScores] = useState({
        strategy: 0,
        clarity: 0,
        tone: 0,
        diagnosis: 0,
        closing: 0,
    });
    const [choiceCount, setChoiceCount] = useState(0);
    const [showFeedback, setShowFeedback] = useState(false);
    const [lastChoice, setLastChoice] = useState(null);
    const [isComplete, setIsComplete] = useState(false);
    const [finalResult, setFinalResult] = useState(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (scenario) {
            setCurrentNodeId(scenario.startNodeId);
        }
    }, [scenario]);

    const currentNode = scenario?.nodes?.[currentNodeId];

    const handleChoice = (choice) => {
        setLastChoice(choice);
        setShowFeedback(true);
        setChoiceCount(prev => prev + 1);

        // Update scores
        if (choice.points) {
            setScores(prev => ({
                strategy: prev.strategy + (choice.points.strategy || 0),
                clarity: prev.clarity + (choice.points.clarity || 0),
                tone: prev.tone + (choice.points.tone || 0),
                diagnosis: prev.diagnosis + (choice.points.diagnosis || 0),
                closing: prev.closing + (choice.points.closing || 0),
            }));
        }

        // Add to history
        setHistory(prev => [...prev, {
            nodeId: currentNodeId,
            choiceId: choice.id,
            choiceText: choice.text,
            feedback: choice.feedback,
        }]);
    };

    const handleContinue = () => {
        setShowFeedback(false);

        const nextNodeId = lastChoice?.nextNodeId;
        if (nextNodeId) {
            const nextNode = scenario.nodes[nextNodeId];
            if (nextNode?.type === 'end') {
                setIsComplete(true);
                setFinalResult(nextNode);
            } else {
                setCurrentNodeId(nextNodeId);
            }
        }

        setLastChoice(null);
    };

    const handleAutoAdvance = () => {
        if (currentNode?.nextNodeId) {
            const nextNode = scenario.nodes[currentNode.nextNodeId];
            if (nextNode?.type === 'end') {
                setIsComplete(true);
                setFinalResult(nextNode);
            } else {
                setCurrentNodeId(currentNode.nextNodeId);
            }
        }
    };

    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    const maxPossibleScore = choiceCount * 500; // 100 per criterion * 5 criteria
    const scorePercentage = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

    if (authLoading || !user) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loader}></div>
                <p>Carregando...</p>
            </div>
        );
    }

    if (!scenario) {
        return (
            <div className={styles.errorContainer}>
                <p>Cenário não encontrado</p>
                <Link href="/roleplay">
                    <Button>Voltar para Arena</Button>
                </Link>
            </div>
        );
    }

    // Results Screen
    if (isComplete) {
        return (
            <div className={styles.resultsWrapper}>
                <div className={styles.resultsContainer}>
                    <div className={styles.resultsHeader}>
                        {finalResult?.result === 'success' && (
                            <div className={styles.resultsBadge + ' ' + styles.success}>🎉 Sucesso!</div>
                        )}
                        {finalResult?.result === 'partial' && (
                            <div className={styles.resultsBadge + ' ' + styles.partial}>⚡ Parcial</div>
                        )}
                        {finalResult?.result === 'failure' && (
                            <div className={styles.resultsBadge + ' ' + styles.failure}>❌ Não foi dessa vez</div>
                        )}
                        <h1>{scenario.title}</h1>
                        <p className={styles.resultsMessage}>{finalResult?.content}</p>
                    </div>

                    <div className={styles.scoreCard}>
                        <div className={styles.totalScore}>
                            <div className={styles.scoreCircle}>
                                <span className={styles.scoreValue}>{totalScore}</span>
                                <span className={styles.scoreLabel}>pontos</span>
                            </div>
                            <div className={styles.scorePercentage}>
                                {scorePercentage}% de aproveitamento
                            </div>
                        </div>

                        <div className={styles.criteriaGrid}>
                            {Object.entries(CRITERIA_LABELS).map(([key, label]) => {
                                const maxForCriterion = choiceCount * 100;
                                const percentage = maxForCriterion > 0 ? (scores[key] / maxForCriterion) * 100 : 0;
                                return (
                                    <div key={key} className={styles.criterionItem}>
                                        <div className={styles.criterionHeader}>
                                            <span className={styles.criterionIcon}>{CRITERIA_ICONS[key]}</span>
                                            <span className={styles.criterionLabel}>{label}</span>
                                            <span className={styles.criterionScore}>{scores[key]}</span>
                                        </div>
                                        <Progress
                                            value={percentage}
                                            max={100}
                                            showValue={false}
                                            size="sm"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className={styles.resultsActions}>
                        <Link href={`/roleplay/${params.id}`}>
                            <Button variant="outline" onClick={() => window.location.reload()}>
                                🔄 Tentar Novamente
                            </Button>
                        </Link>
                        <Link href="/roleplay">
                            <Button variant="primary">
                                ← Voltar para Arena
                            </Button>
                        </Link>
                    </div>

                    <Card className={styles.historyCard}>
                        <CardContent>
                            <h3>📝 Histórico de Escolhas</h3>
                            <div className={styles.historyList}>
                                {history.map((item, index) => (
                                    <div key={index} className={styles.historyItem}>
                                        <div className={styles.historyNumber}>{index + 1}</div>
                                        <div className={styles.historyContent}>
                                            <p className={styles.historyChoice}>{item.choiceText}</p>
                                            <p className={styles.historyFeedback}>{item.feedback}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Playing Screen
    return (
        <div className={styles.playerWrapper}>
            <div className={styles.playerHeader}>
                <Link href="/roleplay" className={styles.backLink}>
                    ← Sair
                </Link>
                <div className={styles.scenarioInfo}>
                    <h2>{scenario.title}</h2>
                    <Badge variant="outline">{'⭐'.repeat(scenario.difficulty)}</Badge>
                </div>
                <div className={styles.scorePreview}>
                    <span className={styles.scoreIcon}>🎯</span>
                    <span>{totalScore} pts</span>
                </div>
            </div>

            <div className={styles.playerContent}>
                <div className={styles.dialogueContainer}>
                    {/* Current Node */}
                    {currentNode && (
                        <div className={`${styles.dialogueBubble} ${styles[currentNode.speaker]}`}>
                            {currentNode.speakerName && (
                                <div className={styles.speakerName}>{currentNode.speakerName}</div>
                            )}
                            <p>{currentNode.content}</p>
                        </div>
                    )}

                    {/* Feedback Overlay */}
                    {showFeedback && lastChoice && (
                        <div className={styles.feedbackOverlay}>
                            <Card className={styles.feedbackCard}>
                                <CardContent>
                                    <div className={styles.feedbackHeader}>
                                        <span className={styles.feedbackIcon}>💡</span>
                                        <h4>Feedback</h4>
                                    </div>
                                    <p className={styles.feedbackText}>{lastChoice.feedback}</p>
                                    <div className={styles.reasoningBox}>
                                        <strong>Raciocínio Estratégico:</strong>
                                        <p>{lastChoice.reasoning}</p>
                                    </div>
                                    <div className={styles.pointsEarned}>
                                        {Object.entries(lastChoice.points || {}).map(([key, value]) => (
                                            <Badge key={key} variant={value >= 70 ? 'success' : value >= 40 ? 'warning' : 'error'}>
                                                {CRITERIA_ICONS[key]} +{value}
                                            </Badge>
                                        ))}
                                    </div>
                                    <Button variant="primary" fullWidth onClick={handleContinue}>
                                        Continuar →
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>

                {/* Choice Options */}
                {currentNode?.type === 'choice' && !showFeedback && (
                    <div className={styles.choicesContainer}>
                        <h4 className={styles.choicesTitle}>Escolha sua resposta:</h4>
                        <div className={styles.choicesGrid}>
                            {currentNode.choices.map((choice, index) => (
                                <button
                                    key={choice.id}
                                    className={styles.choiceButton}
                                    onClick={() => handleChoice(choice)}
                                >
                                    <span className={styles.choiceNumber}>{index + 1}</span>
                                    <span className={styles.choiceText}>{choice.text}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Auto-advance for dialogue nodes */}
                {currentNode?.type === 'dialogue' && !showFeedback && currentNode?.nextNodeId && (
                    <div className={styles.continueContainer}>
                        <Button variant="primary" onClick={handleAutoAdvance}>
                            Continuar →
                        </Button>
                    </div>
                )}
            </div>

            <div className={styles.playerFooter}>
                <div className={styles.progressIndicator}>
                    <span>Decisões tomadas: {choiceCount}</span>
                </div>
            </div>
        </div>
    );
}
