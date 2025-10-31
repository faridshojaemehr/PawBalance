'use client';

import {useState, useEffect, type ReactNode} from 'react';
import {getAuth, type Auth} from 'firebase/auth';
import {getFirestore, type Firestore} from 'firebase/firestore';
import {FirebaseProvider} from './provider';
import {initializeApp, type FirebaseApp} from 'firebase/app';
import {firebaseConfig} from './config';

type FirebaseServices = {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
};

/**
 * Initializes Firebase services on the client-side.
 * This component ensures that Firebase is initialized only once.
 *
 * @param {object} props - The component props.
 * @param {ReactNode} props.children - The children to render.
 * @returns {React.ReactElement} The provider for Firebase services.
 */
export function FirebaseClientProvider({children}: {children: ReactNode}) {
  const [services, setServices] = useState<FirebaseServices | null>(null);

  useEffect(() => {
    // Initialize Firebase on the client
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    setServices({app, auth, firestore});
  }, []);

  if (!services) {
    // You can render a loading state here if needed
    return null;
  }

  return (
    <FirebaseProvider
      app={services.app}
      auth={services.auth}
      firestore={services.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
