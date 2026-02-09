'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import styles from './page.module.css';

export default function LoginPage() {
    const router = useRouter();
    const { signIn, signUp, loading } = useAuth();

    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            if (isLogin) {
                const { error } = await signIn(email, password);
                if (error) {
                    setError('Email ou senha incorretos');
                } else {
                    router.push('/');
                }
            } else {
                if (!fullName.trim()) {
                    setError('Por favor, informe seu nome');
                    setIsSubmitting(false);
                    return;
                }
                const { error } = await signUp(email, password, fullName);
                if (error) {
                    setError(error.message || 'Erro ao criar conta');
                } else {
                    router.push('/');
                }
            }
        } catch (err) {
            setError('Ocorreu um erro. Tente novamente.');
        }

        setIsSubmitting(false);
    };

    return (
        <div className={styles.loginWrapper}>
            <div className={styles.loginLeft}>
                <div className={styles.loginBrand}>
                    <div className={styles.loginLogo}>V</div>
                    <div className={styles.loginLogoText}>
                        <span className={styles.loginLogoTitle}>Voppi</span>
                        <span className={styles.loginLogoSubtitle}>Arena de Roleplay</span>
                    </div>
                </div>

                <div className={styles.loginHero}>
                    <h1>Domine a arte da venda</h1>
                    <p>
                        Treine com simulações realistas, aprenda a contornar objeções
                        e evolua como comercial na plataforma oficial da Voppi.
                    </p>

                    <div className={styles.loginFeatures}>
                        <div className={styles.loginFeature}>
                            <span className={styles.loginFeatureIcon}>🎯</span>
                            <span>Roleplay interativo</span>
                        </div>
                        <div className={styles.loginFeature}>
                            <span className={styles.loginFeatureIcon}>💬</span>
                            <span>Contorno de objeções</span>
                        </div>
                        <div className={styles.loginFeature}>
                            <span className={styles.loginFeatureIcon}>🏆</span>
                            <span>Gamificação completa</span>
                        </div>
                        <div className={styles.loginFeature}>
                            <span className={styles.loginFeatureIcon}>📈</span>
                            <span>Feedback instantâneo</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.loginRight}>
                <div className={styles.loginCard}>
                    <div className={styles.loginHeader}>
                        <h2>{isLogin ? 'Bem-vindo de volta!' : 'Criar conta'}</h2>
                        <p>{isLogin ? 'Entre para acessar a arena' : 'Junte-se à equipe comercial Voppi'}</p>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.loginForm}>
                        {!isLogin && (
                            <Input
                                id="fullName"
                                name="fullName"
                                label="Nome completo"
                                type="text"
                                placeholder="Seu nome"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        )}

                        <Input
                            id="email"
                            name="email"
                            label="Email"
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <Input
                            id="password"
                            name="password"
                            label="Senha"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        {error && (
                            <div className={styles.loginError}>
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            loading={isSubmitting}
                        >
                            {isLogin ? 'Entrar' : 'Criar conta'}
                        </Button>
                    </form>

                    <div className={styles.loginDivider}>
                        <span>ou</span>
                    </div>

                    <button
                        className={styles.loginSwitch}
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                        }}
                    >
                        {isLogin
                            ? 'Não tem conta? Criar agora'
                            : 'Já tem conta? Fazer login'
                        }
                    </button>

                    <div className={styles.loginHint}>
                        <p>🔐 <strong>Admin:</strong> admin@voppi.com / @Voppi2026</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
