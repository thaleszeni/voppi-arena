'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, getUserProfile } from '@/lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        // 1. Get initial session immediately
        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (isMounted && session?.user) {
                    setUser(session.user);
                    const userProfile = await getUserProfile(session.user.id);
                    if (isMounted) setProfile(userProfile);
                }
            } catch (error) {
                console.error('Error getting initial session:', error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        initAuth();

        // 2. Setup auth change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(`Auth event: ${event}`);

            if (!isMounted) return;

            if (session?.user) {
                setUser(session.user);
                // Only fetch profile if it's missing or if it's a significant event (like SIGNED_IN)
                if (!profile || event === 'SIGNED_IN') {
                    const userProfile = await getUserProfile(session.user.id);
                    if (isMounted) setProfile(userProfile);
                }
            } else {
                setUser(null);
                setProfile(null);
            }

            setLoading(false);
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
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
            // Create or update user profile
            const isAdmin = email === 'thales@voppimais.com.br' || email === 'admin@voppi.com';
            await supabase.from('profiles').upsert({
                id: data.user.id,
                full_name: fullName,
                role: isAdmin ? 'admin' : 'user',
                level: 1,
                total_points: 0,
            });
        }

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

    const updateProfile = async (updates) => {
        if (!user) {
            console.error('UpdateProfile failed: User not authenticated');
            return { error: { message: 'Usuário não autenticado' } };
        }

        console.log('UpdateProfile called with:', updates);

        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id);

        if (!error) {
            console.log('UpdateProfile: Supabase update success. Updating local state...');
            setProfile(prev => {
                const newState = { ...prev, ...updates };
                console.log('New Profile State:', newState);
                return newState;
            });
        } else {
            console.error('UpdateProfile: Supabase update error:', error);
        }

        return { data, error };
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
        updateProfile,
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
