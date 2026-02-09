'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { getScenario } from '@/lib/scenarios';
import { supabase } from '@/lib/supabase';
import { getAIResponse, evaluateRoleplay } from '@/lib/aiRoleplay';
import { REWARDS, getXPForLevel } from '@/lib/gameConfig';
import { getEnrichedProfile } from '@/lib/personaProfiles';
import VoppiButton from '@/components/ui/Button';
import Card, { CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Progress from '@/components/ui/Progress';
import LeadProfilePanel from '@/components/roleplay/LeadProfilePanel';
import styles from './page.module.css';

export default function AIChatRoleplayPage() {
    const { user, profile, loading: authLoading, updateProfile } = useAuth();
    const router = useRouter();
    const params = useParams();

    const [scenario, setScenario] = useState(null);
    const [enrichedProfile, setEnrichedProfile] = useState(null);
    const [showProfile, setShowProfile] = useState(false);
    const [fetchingScenario, setFetchingScenario] = useState(true);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [evaluation, setEvaluation] = useState(null);
    const [xpBreakdown, setXpBreakdown] = useState(null);

    const scrollRef = useRef(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        async function loadScenario() {
            setFetchingScenario(true);
            try {
                let foundScenario = getScenario(params.id);
                if (!foundScenario) {
                    const { data } = await supabase
                        .from('scenarios')
                        .select('*')
                        .eq('slug', params.id)
                        .single();
                    if (data) foundScenario = data;
                }

                if (foundScenario) {
                    setScenario(foundScenario);

                    // Load enriched profile if available
                    if (foundScenario.enrichedProfileId) {
                        const profile = getEnrichedProfile(foundScenario.enrichedProfileId);
                        setEnrichedProfile(profile);
                        setShowProfile(true); // Auto-show profile initially
                    }

                    // Initial message from lead
                    setMessages([
                        { role: 'assistant', content: "[Sons de fundo] Alô, pois não? Quem fala?" }
                    ]);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setFetchingScenario(false);
            }
        }
        if (params.id) loadScenario();
    }, [params.id]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isThinking || isComplete) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsThinking(true);

        try {
            const aiContent = await getAIResponse([...messages, userMsg], scenario);
            setMessages(prev => [...prev, { role: 'assistant', content: aiContent }]);
        } catch (err) {
            console.error(err);
        } finally {
            setIsThinking(false);
        }
    };

    const handleFinish = async () => {
        setIsComplete(true);
        const evalResult = await evaluateRoleplay(messages, scenario);
        setEvaluation(evalResult);

        const breakdown = {
            conclusion: REWARDS.CONCLUSION,
            performance: evalResult.totalXP - REWARDS.CONCLUSION,
            total: evalResult.totalXP
        };
        setXpBreakdown(breakdown);

        // Save attempt to Supabase (triggers profile update via DB function)
        if (user) {
            try {
                const { error } = await supabase.from('attempts').insert({
                    user_id: user.id,
                    scenario_id: scenario.id.length === 36 ? scenario.id : undefined, // Only if UUID
                    scenario_slug: scenario.id, // Fallback for hardcoded
                    score_strategy: evalResult.scores.strategy,
                    score_clarity: evalResult.scores.clarity,
                    score_tone: evalResult.scores.tone,
                    score_diagnosis: evalResult.scores.diagnosis,
                    score_closing: evalResult.scores.closing,
                    total_score: evalResult.totalXP,
                    xp_earned: evalResult.totalXP,
                    result: 'success', // Always success if completed? Or depend on score?
                    choice_history: messages,
                    milestones_achieved: []
                });

                if (error) {
                    console.error('Error saving attempt:', error);
                } else {
                    console.log('Attempt saved successfully!');
                    // Refresh profile to get new level/points from trigger
                    if (updateProfile) updateProfile({});
                }
            } catch (err) {
                console.error('Exception saving attempt:', err);
            }
        }
    };

    if (authLoading || fetchingScenario) {
        return <div className={styles.loading}>Carregando...</div>;
    }

    if (!scenario) return <div>Cenário não encontrado.</div>;

    if (isComplete) {
        return (
            <div className={styles.resultsWrapper}>
                <div className={styles.resultsContainer}>
                    <h1>Avaliação do Roleplay de IA</h1>
                    <p>{evaluation?.feedback}</p>

                    <div className={styles.scoreCard}>
                        {Object.entries(evaluation?.scores || {}).map(([key, score]) => (
                            <div key={key} className={styles.scoreItem}>
                                <span>{key.toUpperCase()}</span>
                                <Progress value={score} max={100} size="sm" />
                                <span>{score}/100</span>
                            </div>
                        ))}
                    </div>

                    <div className={xpBreakdown ? styles.xpBox : ''}>
                        {xpBreakdown && (
                            <>
                                <h3>XP Ganhos: +{xpBreakdown.total}</h3>
                                <div className={styles.xpRow}>
                                    <span>Base: {xpBreakdown.conclusion}</span>
                                    <span>IA Performance: {xpBreakdown.performance}</span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className={styles.resultsActions}>
                        <Link href="/roleplay">
                            <VoppiButton variant="primary">Voltar para Arena</VoppiButton>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const SOUNDS = {
        'restaurant_gatekeeper': 'https://assets.mixkit.co/sfx/preview/mixkit-busy-restaurant-ambience-442.mp3',
        'park': 'https://assets.mixkit.co/sfx/preview/mixkit-park-ambience-with-birds-and-people-1226.mp3',
        'default': 'https://assets.mixkit.co/sfx/preview/mixkit-office-ambience-with-keyboard-typing-signals-443.mp3'
    };

    return (
        <div className={styles.chatWrapper}>
            <audio src={SOUNDS[scenario.category] || SOUNDS.default} autoPlay loop />

            <div className={styles.chatHeader}>
                <div className={styles.headerInfo}>
                    <h2>AI Roleplay: {scenario.title}</h2>
                    <Badge variant="secondary">Modo Conversa Livre</Badge>
                </div>
                <div className={styles.headerActions}>
                    {enrichedProfile && (
                        <VoppiButton
                            variant="outline"
                            size="sm"
                            onClick={() => setShowProfile(!showProfile)}
                        >
                            {showProfile ? '✕ Ocultar Perfil' : '📋 Ver Perfil do Lead'}
                        </VoppiButton>
                    )}
                    <VoppiButton variant="outline" size="sm" onClick={handleFinish}>Encerrar e Avaliar</VoppiButton>
                </div>
            </div>

            <div className={styles.messagesList} ref={scrollRef}>
                {messages && messages.map((m, i) => (
                    <div key={i} className={`${styles.message} ${m.role === 'assistant' ? styles.assistant : styles.user}`}>
                        <div className={styles.avatar}>{m.role === 'assistant' ? '👤' : '✉️'}</div>
                        <div className={styles.bubble}>{m.content}</div>
                    </div>
                ))}
                {isThinking && <div className={styles.thinking}>O lead está digitando...</div>}
            </div>

            <div className={styles.inputArea}>
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Digite sua resposta..."
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                />
                <VoppiButton onClick={handleSend} disabled={isThinking}>Enviar</VoppiButton>
            </div>

            {/* Lead Profile Panel */}
            <LeadProfilePanel
                profile={enrichedProfile}
                isVisible={showProfile}
                onClose={() => setShowProfile(false)}
            />
        </div>
    );
}
