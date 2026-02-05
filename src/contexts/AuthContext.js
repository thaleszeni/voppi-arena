'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, getUserProfile } from '@/lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        const getInitialSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    setUser(session.user);
                    const userProfile = await getUserProfile(session.user.id);
                    setProfile(userProfile);
                }
            } catch (error) {
                console.error('Error getting session:', error);
            } finally {
                setLoading(false);
            }
        };

        getInitialSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
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

        return () => subscription.unsubscribe();
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
            await supabase.from('users').insert({
                id: data.user.id,
                full_name: fullName,
                role: 'user',
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

    const refreshProfile = async () => {
        if (user) {
            const userProfile = await getUserProfile(user.id);
            setProfile(userProfile);
        }
    };

    const value = {
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        isAdmin: profile?.role === 'admin',
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
