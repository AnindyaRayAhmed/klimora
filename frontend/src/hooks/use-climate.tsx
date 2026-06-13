import { useState, useEffect } from 'react';
import { localitiesClient, climateClient } from '../lib/api/domains.client';
import { adaptClimateScoreToLocality } from '../lib/api/adapters';
import { useAppStore } from '../store';
import { type Locality } from '../lib/ui-constants';

export function useDashboardIntelligence() {
  const { selectedLocalityId, setSelectedLocalityId, detectedCoordinates, setDetectedCoordinates } = useAppStore();
  
  const [localitiesRaw, setLocalitiesRaw] = useState<any[]>([]);
  const [activeLocalityData, setActiveLocalityData] = useState<Locality | null>(null);
  const [localitiesWithPins, setLocalitiesWithPins] = useState<Locality[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [isHydratingScore, setIsHydratingScore] = useState(false);

  useEffect(() => {
    localitiesClient.list().then(res => {
      const data = res.data || [];
      setLocalitiesRaw(data);
      
      const mapped = data.map((l:any) => adaptClimateScoreToLocality(l, {}));
      setLocalitiesWithPins(mapped);

      if (!selectedLocalityId && mapped.length > 0) {
        if (navigator.geolocation) {
          console.log("[Geolocation] Attempting to get coordinates...");
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              console.log("[Geolocation] Detected coordinates:", latitude, longitude);
              setDetectedCoordinates({ lat: latitude, lng: longitude });
              setSelectedLocalityId("dynamic");
              setLoadingInitial(false);
            },
            (error) => {
              console.warn("[Geolocation] Fallback triggered:", error.message, "Using neutral state");
              setLoadingInitial(false);
            },
            { timeout: 8000 }
          );
        } else {
          console.warn("[Geolocation] Not supported by browser. Using neutral state");
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
    if (!selectedLocalityId) return;

    const fetchScore = async () => {
      setIsHydratingScore(true);
      try {
        if (selectedLocalityId === "dynamic" && detectedCoordinates) {
          console.log("[Climate Data] Fetching dynamic score for", detectedCoordinates);
          const scoreRes = await climateClient.getDynamicScore(detectedCoordinates.lat, detectedCoordinates.lng);
          const dynamicLocality = {
            id: scoreRes.data.id,
            slug: scoreRes.data.slug,
            name: scoreRes.data.name,
            city: scoreRes.data.city,
            state: scoreRes.data.state,
            country: scoreRes.data.country,
            latitude: scoreRes.data.latitude,
            longitude: scoreRes.data.longitude
          };
          const frontendObj = adaptClimateScoreToLocality(dynamicLocality, scoreRes.data);
          setActiveLocalityData(frontendObj);
        } else {
          const locRaw = localitiesRaw.find(l => l.slug === selectedLocalityId);
          if (!locRaw) return;
          console.log("[Climate Data] Fetching locality score for", locRaw.slug);
          const scoreRes = await climateClient.getLocalityScore(locRaw.slug);
          const frontendObj = adaptClimateScoreToLocality(locRaw, scoreRes.data);
          setActiveLocalityData(frontendObj);
          setLocalitiesWithPins(prev => prev.map(p => p.id === frontendObj.id ? frontendObj : p));
        }
      } catch (err) {
        console.error("[Climate Data] Failed to fetch score", err);
      } finally {
        setIsHydratingScore(false);
      }
    };

    fetchScore();
    const interval = setInterval(fetchScore, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [selectedLocalityId, detectedCoordinates, localitiesRaw]);

  return { 
    localitiesRaw,
    localitiesWithPins,
    activeLocalityData, 
    loadingInitial, 
    isHydratingScore 
  };
}
