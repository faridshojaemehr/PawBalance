'use client';

import {useState, useEffect} from 'react';
import {
  onSnapshot,
  type DocumentData,
  type DocumentReference,
} from 'firebase/firestore';

/**
 * The result of the `useDoc` hook.
 *
 * @template T - The type of the document.
 */
export interface UseDocResult<T> {
  data: (T & {id: string}) | null;
  loading: boolean;
  error: Error | null;
}

/**
 * A hook to listen to a document in Firestore.
 *
 * @template T - The type of the document.
 * @param {DocumentReference<DocumentData> | null} docRef - The reference to the document to listen to.
 * @returns {UseDocResult<T>} The document data, loading state, and error.
 */
export function useDoc<T>(
  docRef: DocumentReference<DocumentData> | null
): UseDocResult<T> {
  const [data, setData] = useState<(T & {id: string}) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!docRef) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const docData = {
            id: snapshot.id,
            ...snapshot.data(),
          } as T & {id: string};
          setData(docData);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [docRef]);

  return {data, loading, error};
}
