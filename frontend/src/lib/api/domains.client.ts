import { apiClient } from './api-client';

export const localitiesClient = {
  list: () => apiClient<any[]>('/localities'),
};

export const climateClient = {
  getLocalityScore: (localityId: string) => 
    apiClient<any>(`/climate/latest?localityId=${localityId}`),
  
  getHistory: (localityId: string) => 
    apiClient<any>(`/climate/localities/${localityId}/history`),

  getForecast: (localityId: string) => 
    apiClient<any>(`/forecasts/localities/${localityId}`),

  getDynamicScore: (lat: number, lng: number) => 
    apiClient<any>(`/climate/coordinates?lat=${lat}&lng=${lng}`),
};

export const ritClient = {
  chat: (
    message: string, 
    localityId: string, 
    conversationId?: string, 
    lat?: number, 
    lng?: number,
    climateMetrics?: {
      temperatureC?: number | null;
      aqi?: number | null;
      ndvi?: number | null;
      rainfallMm?: number | null;
      score?: number | null;
    }
  ) => 
    apiClient<any>(`/rit/chat`, {
      method: 'POST',
      body: JSON.stringify({ message, localityId, conversationId, lat, lng, climateMetrics })
    }),

  getInsights: (localityId: string) => 
    apiClient<any>(`/rit/insights?localityId=${localityId}`),

  getConversations: () => 
    apiClient<any>(`/rit/conversations`),

  getConversationHistory: (conversationId: string) => 
    apiClient<any>(`/rit/conversations/${conversationId}`),
};

export const recommendationsClient = {
  getUserRecommendations: (localityId: string, userId?: string) => 
    apiClient<any>(`/recommendations${userId ? `/user/${userId}` : ''}?localityId=${localityId}`),
};

export const missionsClient = {
  list: () => apiClient<any[]>('/missions'),
};

export const verificationClient = {
  submitMission: (formData: FormData) => 
    apiClient<any>(`/verification/submit`, {
      method: 'POST',
      body: formData
    }),

  getStatus: (submissionId: string) => 
    apiClient<any>(`/verification/status/${submissionId}`),
};

export const communityClient = {
  getRankings: () => 
    apiClient<any>(`/community/rankings`),
};
