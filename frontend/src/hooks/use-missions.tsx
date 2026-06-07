import { useState, useEffect } from 'react';
import { missionsClient, recommendationsClient } from '../lib/api/domains.client';
import { useAppStore } from '../store';
import { useAuth } from './use-auth';

// We map extra UI metadata to backend slugs since it's not stored in MVP db
const missionImpactFactors: Record<string, { co2Kg: number; communityPts: number; wardPts: number; scoreLift: number; difficulty: string; impact: string; verification: string }> = {
  'plant-tree': { co2Kg: 21, communityPts: 12, wardPts: 18, scoreLift: 1.2, difficulty: 'Medium', impact: 'High', verification: 'Photo + GPS' },
  'rooftop-garden': { co2Kg: 38, communityPts: 22, wardPts: 30, scoreLift: 2.4, difficulty: 'Hard', impact: 'High', verification: 'Photo + Location' },
  'rainwater-harvesting': { co2Kg: 18, communityPts: 24, wardPts: 28, scoreLift: 2.0, difficulty: 'Hard', impact: 'Critical', verification: 'Photo + Receipt' },
  'public-transport': { co2Kg: 6, communityPts: 2, wardPts: 3, scoreLift: 0.1, difficulty: 'Easy', impact: 'Low', verification: 'Ticket photo' },
  'community-cleanup': { co2Kg: 5, communityPts: 28, wardPts: 22, scoreLift: 1.0, difficulty: 'Medium', impact: 'High', verification: 'Event photo' },
  'civic-reporting': { co2Kg: 12, communityPts: 14, wardPts: 16, scoreLift: 0.9, difficulty: 'Easy', impact: 'High', verification: 'Photo + Desc' },
};

export function useMissions() {
  const { user } = useAuth();
  const { selectedLocalityId } = useAppStore();
  const [missions, setMissions] = useState<any[]>([]);
  const [recommendedIds, setRecommendedIds] = useState<Set<string>>(new Set());
  const [recommendationDetails, setRecommendationDetails] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    missionsClient.list().then(res => {
      const enhanced = (res.data || []).map((m: any) => {
        const impact = missionImpactFactors[m.slug] || { co2Kg: 5, communityPts: 5, wardPts: 5, scoreLift: 0.5, difficulty: 'Medium', impact: 'Moderate', verification: 'Photo' };
        return { ...m, ...impact };
      });
      setMissions(enhanced);
      setLoading(false);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedLocalityId) return;

    recommendationsClient.getUserRecommendations(selectedLocalityId, user?.id).then(res => {
      const candidates = res.data || [];
      const recIds = new Set<string>();
      const details: Record<string, string> = {};
      
      candidates.forEach((c: any) => {
        recIds.add(c.missionId);
        if (c.explanation) {
          details[c.missionId] = c.explanation;
        }
      });
      
      setRecommendedIds(recIds);
      setRecommendationDetails(details);
    }).catch(console.error);
  }, [selectedLocalityId, user]);

  return { missions, recommendedIds, recommendationDetails, loading };
}
