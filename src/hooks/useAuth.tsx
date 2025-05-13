
import { useState } from 'react';

// Simplified auth hook without actual authentication
export const useAuth = () => {
  // Always return authenticated for all users
  const [user] = useState({ email: "user@example.com", id: "default-user" });
  const [loading] = useState(false);

  // These functions are stubs that don't perform any actual authentication
  const signIn = async () => ({ success: true });
  const signUp = async () => ({ success: true });
  const signOut = async () => ({ success: true });
  const getAccessToken = () => "mock-token";

  return { 
    user, 
    session: null,
    loading, 
    signIn, 
    signUp, 
    signOut,
    getAccessToken
  };
};
