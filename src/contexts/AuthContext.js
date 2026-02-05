'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, getUserProfile } from '@/lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let subscription = null;

        const initAuth = async () => {
            try {
                // 1. Get initial session
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    setUser(session.user);
                    const userProfile = await getUserProfile(session.user.id);
                    setProfile(userProfile);
                }

                // 2. Listen for auth changes
                const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(
                    async (event, session) => {
                        console.log('Auth event:', event);
                        if (session?.user) {
                            setUser(session.user);
                            const userProfile = await getUserProfile(session.user.id);
                            setProfile(userProfile);
                        } else {
                            setUser(null);
                            setProfile(null);
                        }
                        setLoading(false);
                    }
                );
                subscription = sub;
            } catch (error) {
                console.error('Fatal error in AuthProvider:', error);
            } finally {
                // Ensure we eventually stop loading
                setTimeout(() => setLoading(false), 2000);
            }
        };

        initAuth();

        return () => {
            if (subscription) subscription.unsubscribe();
        };
    }, []);

    const signIn = async (email, password) => {
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        setLoading(false);
        return { data, error };
    };

    const signUp = async (email, password, fullName) => {
        // Enforce internal domains only
        const allowedDomains = ['voppi.com.br', 'voppimais.com.br'];
        const domain = email.split('@')[1];

        if (!allowedDomains.includes(domain)) {
            return {
                data: null,
                error: { message: 'Apenas e-mails internos (@voppi.com.br ou @voppimais.com.br) podem criar conta.' }
            };
        }

        setLoading(true);
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });

        if (data.user && !error) {
            // Create user profile
            const isAdmin = email === 'thales@voppimais.com.br' || email === 'admin@voppi.com';
            await supabase.from('users').insert({
                id: data.user.id,
                full_name: fullName,
                role: isAdmin ? 'admin' : 'user',
                level: 1,
                total_points: 0,
            });
        }

        setLoading(true); // Should be false but following existing pattern or fixing it
        setLoading(false);
        return { data, error };
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) {
            setUser(null);
            setProfile(null);
        }
        return { error };
    };

    const refreshProfile = async () => {
        if (user) {
            const userProfile = await getUserProfile(user.id);
            setProfile(userProfile);
        }
    };

    const isAdmin = profile?.role === 'admin' ||
        user?.email === 'thales@voppimais.com.br' ||
        user?.email === 'admin@voppi.com';

    const value = {
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        isAdmin,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
