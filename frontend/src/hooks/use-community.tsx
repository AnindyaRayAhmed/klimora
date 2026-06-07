import { useState, useEffect } from 'react';
import { communityClient } from '../lib/api/domains.client';
import { useDashboardIntelligence } from './use-climate';

export function useCommunity() {
  const { localitiesRaw } = useDashboardIntelligence();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [wardRankings, setWardRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    communityClient.getRankings().then((res) => {
      // In a full implementation we'd use the real user names and scores
      // For MVP, we synthesize a leaderboard if the backend doesn't have it
      if (res?.data?.users) {
         setLeaderboard(res.data.users);
      } else {
         setLeaderboard([
           { id: "1", name: "Priya M.", title: "Canopy Keeper", points: 14200, rank: 1, avatar: "PM" },
           { id: "2", name: "Rahul S.", title: "Heat Defender", points: 11450, rank: 2, avatar: "RS" },
           { id: "3", name: "Ananya K.", title: "Water Sentinel", points: 9800, rank: 3, avatar: "AK" },
         ]);
      }
      
      if (res?.data?.wards) {
         setWardRankings(res.data.wards);
      } else {
         // Create ward rankings based on actual localities
         const rankings = localitiesRaw.map((l: any, i: number) => ({
           id: l.id,
           name: l.name,
           points: Math.round(l.climateScore * 100),
           rank: i + 1,
           trend: l.trend
         })).sort((a: any, b: any) => b.points - a.points);
         setWardRankings(rankings);
      }

      setLoading(false);
    }).catch((err) => {
      console.error(err);
      // Fallbacks
      setLeaderboard([
         { id: "1", name: "Priya M.", title: "Canopy Keeper", points: 14200, rank: 1, avatar: "PM" },
      ]);
      setWardRankings(localitiesRaw.map((l: any, i: number) => ({
         id: l.id, name: l.name, points: Math.round(l.climateScore * 100), rank: i + 1, trend: l.trend
      })));
      setLoading(false);
    });
  }, [localitiesRaw]);

  return { leaderboard, wardRankings, loading };
}
