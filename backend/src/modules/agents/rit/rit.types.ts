export enum RitIntent {
  CLIMATE_EXPLANATION = "CLIMATE_EXPLANATION",
  MISSION_RECOMMENDATION = "MISSION_RECOMMENDATION",
  FORECAST_DISCUSSION = "FORECAST_DISCUSSION",
  MISSION_HELP = "MISSION_HELP",
  VERIFICATION_HELP = "VERIFICATION_HELP",
  COMMUNITY_IMPACT = "COMMUNITY_IMPACT",
  ENVIRONMENTAL_QA = "ENVIRONMENTAL_QA",
  GENERAL_CONVERSATION = "GENERAL_CONVERSATION",
  MOTIVATION = "MOTIVATION"
}

export interface RitQuery {
  userId: string;
  localityId: string;
  message: string;
  conversationId?: string;
  lat?: number;
  lng?: number;
  climateMetrics?: {
    temperatureC?: number | null;
    aqi?: number | null;
    ndvi?: number | null;
    rainfallMm?: number | null;
    score?: number | null;
  };
}

export enum RitBehaviorProfile {
  TREE_ADVOCATE = "TREE_ADVOCATE",
  COMMUNITY_VOLUNTEER = "COMMUNITY_VOLUNTEER",
  LOW_ACTIVITY_USER = "LOW_ACTIVITY_USER",
  AQI_CONSCIOUS = "AQI_CONSCIOUS",
  WATER_CONSERVATION_FOCUSED = "WATER_CONSERVATION_FOCUSED",
  GENERAL_USER = "GENERAL_USER"
}

export enum RitInsightSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL"
}

export interface RitContextPacket {
  userProfile?: any;
  behaviorProfile?: RitBehaviorProfile;
  climateScore?: any;
  forecasts?: any;
  freshNdvi?: any;
  activeMissions?: any;
  recommendations?: any;
  verificationResult?: any;
  localityStats?: any;
  recentMemory?: RitConversationMemory;
  dynamicLocation?: { lat: number; lng: number; city: string };
}

export interface RitConversationMemory {
  recentMessages: Array<{ role: string; content: string }>;
  discussedTopics: string[];
  recentSummary: string;
}

export interface RitAnswerContract {
  conversationId: string;
  message: {
    role: "assistant";
    content: string;
    citations: string[];
    intent: RitIntent;
    contextSummary: string;
  };
}

export interface RitAgentResponse {
  agentName: string;
  contribution: string;
}
