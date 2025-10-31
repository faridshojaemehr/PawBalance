'use client';

import {useState, useEffect} from 'react';
import {onAuthStateChanged, type User} from 'firebase/auth';
import {useAuth} from '../provider';

/**
 * A hook to get the current authenticated user.
 *
 * @returns {{user: User | null, loading: boolean}} The current user and loading state.
 */
export function useUser() {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  return {user, loading};
}
