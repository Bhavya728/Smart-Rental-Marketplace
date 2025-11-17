import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for infinite scroll pagination
 */
export function useInfiniteScroll(fetchMore, hasNext = true) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const observerRef = useRef();
  const loadingRef = useRef(false);

  const lastElementRef = useCallback((node) => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNext && !loadingRef.current) {
        loadingRef.current = true;
        setLoading(true);
        setError(null);
        
        fetchMore()
          .then(() => {
            setLoading(false);
            loadingRef.current = false;
          })
          .catch((err) => {
            setError(err.message || 'Failed to load more items');
            setLoading(false);
            loadingRef.current = false;
          });
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [loading, hasNext, fetchMore]);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const reset = () => {
    setLoading(false);
    setError(null);
    loadingRef.current = false;
  };

  return { lastElementRef, loading, error, reset };
}