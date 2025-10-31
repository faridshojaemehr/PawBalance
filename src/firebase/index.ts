import {
  FirebaseProvider,
  useFirebaseApp,
  useFirestore,
  useAuth,
} from './provider';
import {FirebaseClientProvider} from './client-provider';
import {useUser} from './auth/use-user';
import {useCollection} from './firestore/use-collection';
import {useDoc} from './firestore/use-doc';

// Note: `useUser` should be the only thing that's
// needed from the "auth" folder.
// Note: `useCollection` and `useDoc` should be the only things
// that are needed from the "firestore" folder.

export {
  FirebaseProvider,
  FirebaseClientProvider,
  useFirebaseApp,
  useFirestore,
  useAuth,
  useUser,
  useCollection,
  useDoc,
};
