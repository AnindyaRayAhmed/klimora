import { useState, useEffect } from 'react';
import { communityClient } from '../lib/api/domains.client';
import { useDashboardIntelligence } from './use-climate';

export function useCommunity() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [wardRankings, setWardRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUnavailable, setIsUnavailable] = useState(false);

  useEffect(() => {
    communityClient.getRankings().then((res) => {
      if (res?.data?.users) {
         setLeaderboard(res.data.users);
      } else {
         setIsUnavailable(true);
      }
      
      if (res?.data?.wards) {
         setWardRankings(res.data.wards);
      } else {
         setIsUnavailable(true);
      }
      setLoading(false);
    }).catch((err) => {
      console.error("Community APIs currently unavailable:", err);
      setIsUnavailable(true);
      setLoading(false);
    });
  }, []);

  return { leaderboard, wardRankings, loading, isUnavailable, error };
}
