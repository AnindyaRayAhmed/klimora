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
          console.log("[Dynamic Climate] Coordinates detected");
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              console.log("[Geolocation] Detected coordinates:", latitude, longitude);
              setDetectedCoordinates({ lat: latitude, lng: longitude });
              setSelectedLocalityId("dynamic");
              
              // 1. Immediately hydrate with a loading state, we will reverse geocode in fetchScore
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
          // Frontend Reverse Geocoding for Immediate Hydration
          let cityName = "Your Location";
          try {
            const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
            if (apiKey) {
              const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${detectedCoordinates.lat},${detectedCoordinates.lng}&key=${apiKey}`);
              const data = await response.json();
              if (data.results && data.results[0]) {
                const getComponent = (type: string) => 
                  data.results[0].address_components.find((c: any) => c.types.includes(type))?.long_name;
                cityName = getComponent("locality") || getComponent("administrative_area_level_2") || "Your Location";
              }
            }
          } catch (e) {
            console.warn("Frontend reverse geocoding failed, using generic name.");
          }

          // Immediately hydrate with city name and placeholders
          console.log("[Dynamic Climate] Hydrating activeLocalityData");
          setActiveLocalityData(adaptClimateScoreToLocality({
            id: "dynamic",
            slug: "dynamic",
            name: cityName,
            city: cityName,
            latitude: detectedCoordinates.lat,
            longitude: detectedCoordinates.lng
          }, {}));

          console.log("[Dynamic Climate] Fetching climate profile");
          const scoreRes = await climateClient.getDynamicScore(detectedCoordinates.lat, detectedCoordinates.lng);
          console.log("[Dynamic Climate] Climate payload received");
          
          const dynamicLocality = {
            id: scoreRes.data.id,
            slug: scoreRes.data.slug,
            name: scoreRes.data.name || cityName,
            city: scoreRes.data.city || cityName,
            state: scoreRes.data.state,
            country: scoreRes.data.country,
            latitude: scoreRes.data.latitude,
            longitude: scoreRes.data.longitude
          };
          const frontendObj = adaptClimateScoreToLocality(dynamicLocality, scoreRes.data);
          // Progressively enrich
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
        console.error("[Dynamic Climate] Hydration failed", err);
        // Do not revert to null. The initial hydration keeps the panel location-aware.
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
