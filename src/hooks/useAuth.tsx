
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
    });

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session check:', session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async ({ email, password }: { email: string; password: string }) => {
    try {
      console.log('Attempting sign in with:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Sign in error:', error.message);
        throw error;
      }
      
      console.log('Sign in successful:', data?.user?.email);
      localStorage.setItem('supabase_access_token', data?.session?.access_token || '');
      
      return { success: true, session: data?.session };
    } catch (error) {
      console.error('Error signing in:', error);
      return { success: false, error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/login`
        }
      });

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Error signing in with Google:', error);
      return { success: false, error };
    }
  };

  const signUp = async ({ email, password }: { email: string; password: string }) => {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          // Store the registration timestamp for future reference
          data: {
            registered_at: new Date().toISOString()
          }
        }
      });
      
      if (error) throw error;
      
      console.log('Sign up successful:', data?.user?.email);
      toast({
        title: "Account created successfully",
        description: data?.user?.email ? `Welcome ${data.user.email}!` : "Welcome to FraudEye!",
      });
      
      // Auto-login for new accounts to improve user experience
      if (!data?.session) {
        const { data: signInData } = await supabase.auth.signInWithPassword({ email, password });
        if (signInData?.session) {
          localStorage.setItem('supabase_access_token', signInData.session.access_token);
        }
        return { success: true, session: signInData?.session };
      }
      
      localStorage.setItem('supabase_access_token', data?.session?.access_token || '');
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
      
      console.log('Sign out successful');
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
    signInWithGoogle,
    getAccessToken
  };
};
