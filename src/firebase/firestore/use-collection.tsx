'use client';

import {useState, useEffect} from 'react';
import {
  onSnapshot,
  query,
  type DocumentData,
  type Query,
} from 'firebase/firestore';

/**
 * The result of the `useCollection` hook.
 *
 * @template T - The type of the documents in the collection.
 */
export interface UseCollectionResult<T> {
  data: (T & {id: string})[] | null;
  loading: boolean;
  error: Error | null;
}

/**
 * A hook to listen to a collection in Firestore.
 *
 * @template T - The type of the documents in the collection.
 * @param {Query<DocumentData> | null} collectionQuery - The query to listen to.
 * @returns {UseCollectionResult<T>} The collection data, loading state, and error.
 */
export function useCollection<T>(
  collectionQuery: Query<DocumentData> | null
): UseCollectionResult<T> {
  const [data, setData] = useState<(T & {id: string})[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!collectionQuery) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      collectionQuery,
      (snapshot) => {
        const docs = snapshot.docs.map(
          (doc) => ({id: doc.id, ...doc.data()} as T & {id: string})
        );
        setData(docs);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionQuery]);

  return {data, loading, error};
}
