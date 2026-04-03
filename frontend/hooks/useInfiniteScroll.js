/**
 * hooks/useInfiniteScroll.js - IntersectionObserver-based infinite scroll
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * @param {Function} onLoadMore - called when sentinel enters viewport
 * @param {boolean}  hasMore    - stop observing when false
 * @param {boolean}  isLoading  - avoid double-triggers
 */
export const useInfiniteScroll = (onLoadMore, hasMore, isLoading) => {
  const sentinelRef = useRef(null);

  const handleIntersect = useCallback(
    (entries) => {
      if (entries[0].isIntersecting && hasMore && !isLoading) {
        onLoadMore();
      }
    },
    [onLoadMore, hasMore, isLoading]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: '200px',
      threshold: 0,
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleIntersect]);

  return { sentinelRef };
};
