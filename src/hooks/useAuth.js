// src/hooks/useAuth.js
// Escuta onAuthStateChanged e expõe o usuário atual e o estado de carregamento.
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoadingAuth(false);
    });

    return unsubscribe; // remove o listener ao desmontar
  }, []);

  return { user, loadingAuth };
}
