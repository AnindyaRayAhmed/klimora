import { useState, useEffect } from 'react';
import { localitiesClient, climateClient } from '../lib/api/domains.client';
import { adaptClimateScoreToLocality } from '../lib/api/adapters';
import { useAppStore } from '../store';
import { type Locality, defaultLocality } from '../lib/ui-constants';

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

      if (!selectedLocalityId && mapped.length > 0) {
        if (navigator.geolocation) {
          console.log("[Geolocation] Attempting to get coordinates...");
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              console.log("[Geolocation] Detected coordinates:", latitude, longitude);
              
              let closestLoc = mapped[0];
              let minDistance = Infinity;
              
              mapped.forEach(loc => {
                if (loc.coordinates) {
                  // Euclidean distance - rough approximation
                  const dist = Math.sqrt(
                    Math.pow(loc.coordinates.lat - latitude, 2) + 
                    Math.pow(loc.coordinates.lng - longitude, 2)
                  );
                  if (dist < minDistance) {
                    minDistance = dist;
                    closestLoc = loc;
                  }
                }
              });
              
              console.log("[Geolocation] Nearest locality distance:", minDistance, "to", closestLoc.id);
              setSelectedLocalityId(closestLoc.id);
              setLoadingInitial(false);
            },
            (error) => {
              console.warn("[Geolocation] Fallback triggered:", error.message, "Using:", mapped[0].id);
              setSelectedLocalityId(mapped[0].id);
              setLoadingInitial(false);
            },
            { timeout: 8000 }
          );
        } else {
          console.warn("[Geolocation] Not supported by browser. Using default:", mapped[0].id);
          setSelectedLocalityId(mapped[0].id);
          setLoadingInitial(false);
        }
      } else {
        setLoadingInitial(false);
      }
    }).catch(err => {
      console.error(err);
      setLoadingInitial(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedLocalityId || localitiesRaw.length === 0) return;

    const locRaw = localitiesRaw.find(l => l.slug === selectedLocalityId) || localitiesRaw[0];
    
    const fetchScore = async () => {
      setIsHydratingScore(true);
      try {
        const scoreRes = await climateClient.getLocalityScore(locRaw.slug);
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
