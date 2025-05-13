
import { useState } from 'react';

// Simplified auth hook without actual authentication
export const useAuth = () => {
  // Use a valid UUID format for the default user
  const [user] = useState({ email: "user@example.com", id: "00000000-0000-0000-0000-000000000000" });
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
