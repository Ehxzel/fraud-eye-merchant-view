
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current session and user
    const getInitialSession = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async ({ email, password }: { email: string; password: string }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      // Store access token in localStorage for API calls
      if (data?.session?.access_token) {
        localStorage.setItem('supabase_access_token', data.session.access_token);
      }
      
      return { success: true, session: data?.session };
    } catch (error) {
      console.error('Error signing in:', error);
      return { success: false, error };
    }
  };

  const signUp = async ({ email, password }: { email: string; password: string }) => {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      });
      
      if (error) throw error;
      return { success: true, session: data?.session };
    } catch (error) {
      console.error('Error signing up:', error);
      return { success: false, error };
    }
  };

  const signOut = async () => {
    try {
      // Remove access token from localStorage
      localStorage.removeItem('supabase_access_token');
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return { success: false, error };
    }
  };

  const getAccessToken = () => {
    return session?.access_token || localStorage.getItem('supabase_access_token');
  };

  return { 
    user, 
    session,
    loading, 
    signIn, 
    signUp, 
    signOut,
    getAccessToken
  };
};
