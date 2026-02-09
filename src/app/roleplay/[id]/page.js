'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getScenario, generateScenario } from '@/lib/scenarios';
import { supabase } from '@/lib/supabase';
import { MILESTONES, REWARDS, LEAD_TYPES, DIFFICULTY_RULES, getXPForLevel } from '@/lib/gameConfig';
import { calculateStreak } from '@/lib/missions';
import VoppiButton from '@/components/ui/Button';
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
    const { user, profile, loading: authLoading, refreshProfile } = useAuth();
    const router = useRouter();
    const params = useParams();

    const [scenario, setScenario] = useState(null);
    const [fetchingScenario, setFetchingScenario] = useState(true);
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

    // New Game State
    const [achievedMilestones, setAchievedMilestones] = useState([]);
    const [mode, setMode] = useState('guided');
    const [userInput, setUserInput] = useState('');
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [xpBreakdown, setXpBreakdown] = useState(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        async function loadScenario() {
            setFetchingScenario(true);
            try {
                // 1. Try hardcoded first (fastest)
                let foundScenario = getScenario(params.id);

                if (!foundScenario) {
                    // 2. Try Supabase by slug or ID
                    const { data, error } = await supabase
                        .from('scenarios')
                        .select('*')
                        .or(`slug.eq."${params.id}",id.eq."${params.id.length === 36 ? params.id : '00000000-0000-0000-0000-000000000000'}"`)
                        .single();

                    if (!error && data) {
                        foundScenario = generateScenario(data);
                    }
                }

                if (foundScenario) {
                    setScenario(foundScenario);
                    setCurrentNodeId(foundScenario.startNodeId);
                }
            } catch (err) {
                console.error('Error loading scenario:', err);
            } finally {
                setFetchingScenario(false);
            }
        }

        if (params.id) {
            loadScenario();
        }
    }, [params.id]);

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

        // Milestone Tracking
        if (choice.milestoneId && !achievedMilestones.includes(choice.milestoneId)) {
            setAchievedMilestones(prev => [...prev, choice.milestoneId]);
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
                finishRoleplay(nextNode);
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
                finishRoleplay(nextNode);
            } else {
                setCurrentNodeId(currentNode.nextNodeId);
            }
        }
    };

    const handleFreeModeSubmit = async () => {
        if (!userInput.trim()) return;
        setIsEvaluating(true);

        // Simulation of evaluation
        // In a real app, this would call an AI API
        setTimeout(() => {
            // Pick a choice based on text similarity (very basic)
            const choices = currentNode.choices;
            let bestChoice = choices[Math.floor(Math.random() * choices.length)]; // Fallback

            // Try to find a choice that contains some keywords from userInput
            for (const choice of choices) {
                const words = choice.text.toLowerCase().split(' ').filter(w => w.length > 4);
                if (words.some(w => userInput.toLowerCase().includes(w))) {
                    bestChoice = choice;
                    break;
                }
            }

            handleChoice(bestChoice);
            setUserInput('');
            setIsEvaluating(false);
        }, 1500);
    };

    const finishRoleplay = async (resultNode) => {
        setIsComplete(true);
        setFinalResult(resultNode);

        // Calculate XP
        const scorePercentage = Math.round((Object.values(scores).reduce((a, b) => a + b, 0) / (choiceCount * 500)) * 100) || 0;
        const difficultyKey = (scenario?.difficulty >= 4 ? 'advanced' : scenario?.difficulty >= 3 ? 'intermediate' : 'beginner');
        const diffRule = DIFFICULTY_RULES[difficultyKey];

        const breakdown = {
            conclusion: REWARDS.CONCLUSION,
            performance: scorePercentage >= 90 ? REWARDS.PERFORMANCE.GOD_LIKE.xp :
                scorePercentage >= 75 ? REWARDS.PERFORMANCE.PRO.xp :
                    scorePercentage >= 60 ? REWARDS.PERFORMANCE.GOOD.xp :
                        REWARDS.PERFORMANCE.POOR.xp,
            difficulty: diffRule.bonusXP,
            evolution: 0, // Placeholder
            total: 0
        };
        breakdown.total = breakdown.conclusion + breakdown.performance + breakdown.difficulty;
        setXpBreakdown(breakdown);

        // Persistent save to DB
        if (user && scenario) {
            try {
                const totalScoreValue = Object.values(scores).reduce((a, b) => a + b, 0);

                const { error } = await supabase
                    .from('attempts')
                    .insert({
                        user_id: user.id,
                        scenario_id: scenario.id.length === 36 ? scenario.id : null,
                        scenario_slug: scenario.slug || scenario.id,
                        score_strategy: scores.strategy,
                        score_clarity: scores.clarity,
                        score_tone: scores.tone,
                        score_diagnosis: scores.diagnosis,
                        score_closing: scores.closing,
                        total_score: totalScoreValue,
                        xp_earned: breakdown.total,
                        result: resultNode.result,
                        choice_history: history,
                        milestones_achieved: achievedMilestones,
                    });

                if (error) {
                    console.error('Error saving attempt:', error);
                } else {
                    // Update user profile with XP using updateProfile from context for immediate UI feedback
                    const gainedXP = breakdown?.total || 0;
                    const currentXP = profile?.experience || 0;
                    const newExp = currentXP + gainedXP;
                    let newLevel = profile?.level || 1;

                    // Check for level up using gameConfig
                    const xpToNext = getXPForLevel(newLevel + 1);
                    if (newExp >= xpToNext) {
                        newLevel += 1;
                    }

                    console.log('XP Update Debug:', {
                        currentXP,
                        gainedXP,
                        newExp,
                        newLevel,
                        userId: user?.id
                    });

                    // Streak calculation
                    const newStreak = calculateStreak(profile?.last_play_date, profile?.current_streak || 0);

                    const updates = {
                        experience: newExp,
                        level: newLevel,
                        total_points: (profile?.total_points || 0) + totalScoreValue,
                        current_streak: newStreak,
                        last_play_date: new Date().toISOString(),
                        next_level_xp: getXPForLevel(newLevel + 1)
                    };

                    console.log('Sending updates to profile:', updates);

                    const { error: profileError } = await updateProfile(updates);

                    if (profileError) {
                        console.error('Error updating profile XP:', profileError);
                        alert('Erro ao salvar progresso: ' + profileError.message);
                    } else {
                        console.log('Profile updated successfully in DB and State');
                    }
                }
            } catch (err) {
                console.error('Failed to save attempt:', err);
            }
        }
    };

    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    const maxPossibleScore = choiceCount * 500; // 100 per criterion * 5 criteria
    const scorePercentage = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

    if (authLoading || fetchingScenario) {
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
                    <VoppiButton>Voltar para Arena</VoppiButton>
                </Link>
            </div>
        );
    }

    // Results Screen
    if (isComplete) {
        return (
            <div className={styles.resultsWrapper}>
                {/* Background sound stopped on results if desired, or keep generic success music */}
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

                        {xpBreakdown && (
                            <div className={styles.xpSummary}>
                                <div className={styles.xpRow}>
                                    <span className={styles.xpLabel}>Conclusão</span>
                                    <span className={styles.xpValue}>+{xpBreakdown.conclusion} XP</span>
                                </div>
                                <div className={styles.xpRow}>
                                    <span className={styles.xpLabel}>Performance ({scorePercentage}%)</span>
                                    <span className={styles.xpValue}>+{xpBreakdown.performance} XP</span>
                                </div>
                                <div className={styles.xpRow}>
                                    <span className={styles.xpLabel}>Dificuldade</span>
                                    <span className={styles.xpValue}>+{xpBreakdown.difficulty} XP</span>
                                </div>
                                <div className={styles.xpRow}>
                                    <span className={styles.totalLabel}>Total Ganhos</span>
                                    <span className={styles.totalValue}>+{xpBreakdown.total} XP</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.resultsActions}>
                        <Link href={`/roleplay/${params.id}`}>
                            <VoppiButton variant="outline" onClick={() => window.location.reload()}>
                                🔄 Tentar Novamente
                            </VoppiButton>
                        </Link>
                        <Link href="/roleplay">
                            <VoppiButton variant="primary">
                                ← Voltar para Arena
                            </VoppiButton>
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

    // Sound Mapping
    const SOUNDS = {
        'restaurant_gatekeeper': 'https://assets.mixkit.co/sfx/preview/mixkit-busy-restaurant-ambience-442.mp3',
        'restaurant_decision_maker': 'https://assets.mixkit.co/sfx/preview/mixkit-busy-restaurant-ambience-442.mp3',
        'park': 'https://assets.mixkit.co/sfx/preview/mixkit-park-ambience-with-birds-and-people-1226.mp3',
        'default': 'https://assets.mixkit.co/sfx/preview/mixkit-office-ambience-with-keyboard-typing-signals-443.mp3'
    };

    const ambientSoundUrl = SOUNDS[scenario.category] || SOUNDS.default;

    // Playing Screen
    return (
        <div className={styles.playerWrapper}>
            {/* Ambient Audio Element */}
            <audio
                src={ambientSoundUrl}
                autoPlay
                loop
                muted={false}
                onPlay={() => console.log('Ambient sound playing')}
                onError={(e) => console.log('Audio error:', e)}
            />
            <div className={styles.playerHeader}>
                <Link href="/roleplay" className={styles.backLink}>
                    ← Sair
                </Link>
                <div className={styles.scenarioInfo}>
                    <h2>{scenario.title}</h2>
                    <div className={styles.metaBadges}>
                        <Badge variant="outline">{'⭐'.repeat(scenario.difficulty)}</Badge>
                        {scenario.leadType && (
                            <Badge variant="secondary" title={scenario.leadType.description}>
                                {scenario.leadType.icon} {scenario.leadType.name}
                            </Badge>
                        )}
                        <div className={styles.modeToggle}>
                            <button
                                className={`${styles.modeBtn} ${mode === 'guided' ? styles.active : ''}`}
                                onClick={() => setMode('guided')}
                            >
                                Guided
                            </button>
                            <button
                                className={`${styles.modeBtn} ${mode === 'free' ? styles.active : ''}`}
                                onClick={() => setMode('free')}
                            >
                                Free
                            </button>
                        </div>
                    </div>
                </div>
                <div className={styles.scorePreview}>
                    <span className={styles.scoreIcon}>🎯</span>
                    <span>{totalScore} pts</span>
                </div>
            </div>

            {/* Milestones Progress */}
            <div className={styles.milestonesBar}>
                {MILESTONES.map(m => (
                    <div
                        key={m.id}
                        className={`${styles.milestoneDot} ${achievedMilestones.includes(m.id) ? styles.achieved : ''}`}
                        title={m.label}
                    >
                        <span className={styles.milestoneTooltip}>{m.label}</span>
                    </div>
                ))}
            </div>

            {scenario.leadType && !isComplete && (
                <div className={styles.traitAlert}>
                    <span className={styles.traitIcon}>{scenario.leadType.icon}</span>
                    <div className={styles.traitText}>
                        <strong>Lead Type: {scenario.leadType.name}</strong>
                        <p>{scenario.leadType.description}</p>
                        <em className={styles.leadMod}>{scenario.leadType.promptMod}</em>
                    </div>
                </div>
            )}

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
                                    <VoppiButton variant="primary" fullWidth onClick={handleContinue}>
                                        Continuar →
                                    </VoppiButton>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>

                {/* Choice Options */}
                {currentNode?.type === 'choice' && !showFeedback && (
                    <div className={styles.choicesContainer}>
                        {mode === 'guided' ? (
                            <>
                                <h4 className={styles.choicesTitle}>Escolha sua resposta:</h4>
                                <div className={styles.choicesGrid}>
                                    {currentNode.choices.slice(0, 3).map((choice, index) => (
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
                            </>
                        ) : (
                            <div className={styles.freeModeContainer}>
                                <textarea
                                    className={styles.freeTextarea}
                                    placeholder="Digite sua resposta aqui..."
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    disabled={isEvaluating}
                                />
                                <div className={styles.freeActions}>
                                    <VoppiButton
                                        variant="primary"
                                        disabled={!userInput.trim() || isEvaluating}
                                        onClick={handleFreeModeSubmit}
                                        fullWidth
                                    >
                                        {isEvaluating ? 'Avaliando...' : 'Enviar Resposta'}
                                    </VoppiButton>
                                    <p className={styles.freeHint}>Foque em: Ser direto e contornar a dor do lead.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Auto-advance for dialogue nodes */}
                {currentNode?.type === 'dialogue' && !showFeedback && currentNode?.nextNodeId && (
                    <div className={styles.continueContainer}>
                        <VoppiButton variant="primary" onClick={handleAutoAdvance}>
                            Continuar →
                        </VoppiButton>
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
