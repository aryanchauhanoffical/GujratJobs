import { useMemo } from 'react';

export default function useWalkInPriority(jobs = []) {
  return useMemo(() => {
    return [...jobs].sort((a, b) => {
      const sa = a.urgencyScore ?? 0;
      const sb = b.urgencyScore ?? 0;
      if (sb !== sa) return sb - sa;
      // Secondary: earlier walk-in date first within same urgency band
      const da = a.walkInDetails?.date ? new Date(a.walkInDetails.date) : new Date(9999, 0);
      const db = b.walkInDetails?.date ? new Date(b.walkInDetails.date) : new Date(9999, 0);
      return da - db;
    });
  }, [jobs]);
}
