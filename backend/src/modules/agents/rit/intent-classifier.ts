import { RitIntent } from "./rit.types.js";

const intentKeywords: Record<RitIntent, string[]> = {
  [RitIntent.CLIMATE_EXPLANATION]: ["score", "climate", "aqi", "air quality", "heat", "temperature", "ndvi", "vegetation", "greenery", "rainfall", "rain", "weather history", "trend", "risk"],
  [RitIntent.MISSION_RECOMMENDATION]: ["should i do", "what can i do", "recommend", "suggest", "weekend", "action", "help my locality", "improve score"],
  [RitIntent.FORECAST_DISCUSSION]: ["forecast", "future", "tomorrow", "next week", "next 5 days", "heat wave", "upcoming", "deficit"],
  [RitIntent.MISSION_HELP]: ["mission", "how do i do", "difficulty", "benefit", "harvester", "planting", "water harvesting", "impact of tree"],
  [RitIntent.VERIFICATION_HELP]: ["rejected", "verification", "verify", "why did i fail", "evidence", "confidence", "sapling", "tree submission", "passed", "approved"],
  [RitIntent.COMMUNITY_IMPACT]: ["community", "locality impact", "ranking", "leaderboard", "collective", "how many trees planted", "we completed", "our city", "rank"],
  [RitIntent.ENVIRONMENTAL_QA]: ["what is aqi", "why does ndvi matter", "explain ndvi", "how does rainfall anomaly work", "environmental", "climate change"],
  [RitIntent.MOTIVATION]: ["why participate", "motivate", "incentive", "why should i care", "help", "inspire"],
  [RitIntent.GENERAL_CONVERSATION]: ["hello", "hi", "hey", "who are you", "what is your name", "thanks", "thank you"]
};

export class IntentClassifier {
  static classify(message: string): RitIntent {
    const text = message.toLowerCase();
    let bestIntent = RitIntent.GENERAL_CONVERSATION;
    let maxScore = 0;

    for (const [intent, keywords] of Object.entries(intentKeywords)) {
      let score = 0;
      for (const kw of keywords) {
        if (text.includes(kw)) {
          score += 1;
        }
      }
      if (score > maxScore) {
        maxScore = score;
        bestIntent = intent as RitIntent;
      }
    }

    return bestIntent;
  }
}
