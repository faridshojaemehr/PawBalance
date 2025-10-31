'use client';

import {createContext, useContext, type ReactNode} from 'react';
import {type Auth} from 'firebase/auth';
import {type Firestore} from 'firebase/firestore';
import {type FirebaseApp} from 'firebase/app';

/**
 * The context for the Firebase app.
 */
export const FirebaseAppContext = createContext<FirebaseApp | undefined>(
  undefined
);

/**
 * The context for the Firebase Authentication service.
 */
export const AuthContext = createContext<Auth | undefined>(undefined);

/**
 * The context for the Firestore service.
 */
export const FirestoreContext = createContext<Firestore | undefined>(undefined);

type FirebaseProviderProps = {
  children: ReactNode;
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
};

/**
 * Provides the Firebase app, Auth, and Firestore services to its children.
 *
 * @param {FirebaseProviderProps} props - The component props.
 * @returns {React.ReactElement} The provider component.
 */
export function FirebaseProvider({
  children,
  app,
  auth,
  firestore,
}: FirebaseProviderProps) {
  return (
    <FirebaseAppContext.Provider value={app}>
      <AuthContext.Provider value={auth}>
        <FirestoreContext.Provider value={firestore}>
          {children}
        </FirestoreContext.Provider>
      </AuthContext.Provider>
    </FirebaseAppContext.Provider>
  );
}

/**
 * A hook to get the Firebase app instance.
 * Throws an error if the context is not available.
 *
 * @returns {FirebaseApp} The Firebase app instance.
 */
export function useFirebaseApp() {
  const app = useContext(FirebaseAppContext);
  if (!app) {
    throw new Error('useFirebaseApp must be used within a FirebaseProvider');
  }
  return app;
}

/**
 * A hook to get the Firebase Authentication service instance.
 * Throws an error if the context is not available.
 *
 * @returns {Auth} The Firebase Authentication service instance.
 */
export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error('useAuth must be used within a FirebaseProvider');
  }
  return auth;
}

/**
 * A hook to get the Firestore service instance.
 * Throws an error if the context is not available.
 *
 * @returns {Firestore} The Firestore service instance.
 */
export function useFirestore() {
  const firestore = useContext(FirestoreContext);
  if (!firestore) {
    throw new Error('useFirestore must be used within a FirebaseProvider');
  }
  return firestore;
}
