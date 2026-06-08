import { useState, useEffect } from 'react';
import { localitiesClient, climateClient } from '../lib/api/domains.client';
import { adaptClimateScoreToLocality } from '../lib/api/adapters';
import { useAppStore } from '../store';
import { type Locality } from '../lib/ui-constants';

export function useDashboardIntelligence() {
  const { selectedLocalityId, setSelectedLocalityId } = useAppStore();
  
  const [localitiesRaw, setLocalitiesRaw] = useState<any[]>([]);
  const [activeLocalityData, setActiveLocalityData] = useState<Locality>(defaultLocality);
  const [localitiesWithPins, setLocalitiesWithPins] = useState<Locality[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [isHydratingScore, setIsHydratingScore] = useState(false);

  useEffect(() => {
    localitiesClient.list().then(res => {
      const data = res.data || [];
      setLocalitiesRaw(data);
      
      // We map the raw localities onto frontend mock stubs initially to give them pins
      const mapped = data.map((l:any) => adaptClimateScoreToLocality(l, {}));
      setLocalitiesWithPins(mapped);

      if (!selectedLocalityId && data.length > 0) {
        setSelectedLocalityId(data[0].id);
      }
      setLoadingInitial(false);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedLocalityId || localitiesRaw.length === 0) return;

    const locRaw = localitiesRaw.find(l => l.id === selectedLocalityId) || localitiesRaw[0];
    
    const fetchScore = async () => {
      setIsHydratingScore(true);
      try {
        const scoreRes = await climateClient.getLocalityScore(locRaw.id);
        const frontendObj = adaptClimateScoreToLocality(locRaw, scoreRes.data);
        setActiveLocalityData(frontendObj);
        
        // Also update the pin map
        setLocalitiesWithPins(prev => prev.map(p => p.id === frontendObj.id ? frontendObj : p));
      } catch (err) {
        console.error("Failed to fetch score", err);
      } finally {
        setIsHydratingScore(false);
      }
    };

    fetchScore();
    const interval = setInterval(fetchScore, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [selectedLocalityId, localitiesRaw]);

  return { 
    localitiesRaw,
    localitiesWithPins,
    activeLocalityData, 
    loadingInitial, 
    isHydratingScore 
  };
}
