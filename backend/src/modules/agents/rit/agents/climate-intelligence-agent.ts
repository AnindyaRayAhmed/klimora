import { RitContextPacket, RitAgentResponse } from "../rit.types.js";

export class ClimateIntelligenceAgent {
  static analyze(context: RitContextPacket): RitAgentResponse | null {
    if (!context.climateScore) return null;
    
    const { score, label, trend, metrics, breakdown } = context.climateScore;
    let contribution = `Locality Climate Score: ${score}/100 (${label}, trend: ${trend}).\n`;
    
    let ndviVal = metrics.ndvi;
    let ndviSource = "Stored";
    if (context.freshNdvi?.value) {
       ndviVal = context.freshNdvi.value;
       ndviSource = context.freshNdvi.source;
    }

    contribution += `Current metrics: Temp ${metrics.temperatureC}°C, AQI ${metrics.aqi}, Fresh NDVI ${ndviVal} (Source: ${ndviSource}), Rainfall ${metrics.rainfallMm}mm (Anomaly: ${metrics.rainfallAnomalyPct}%).\n`;
    
    if (breakdown && breakdown.length > 0) {
      contribution += `Key Risk Factors:\n`;
      breakdown.forEach((b: any) => {
        contribution += `- ${b.factor}: ${b.reason} (Penalty: -${b.penalty})\n`;
      });
    }
    
    if (context.climateScore.trendNarrative) {
        contribution += `\nTemporal Trend: ${context.climateScore.trendNarrative}\n`;
    }

    return { agentName: "ClimateIntelligenceAgent", contribution };
  }
}
