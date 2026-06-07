import { RitContextPacket, RitAgentResponse } from "../rit.types.js";

export class ForecastIntelligenceAgent {
  static analyze(context: RitContextPacket): RitAgentResponse | null {
    if (!context.forecasts) return null;
    
    let contribution = `Upcoming 5-day Climate Forecast (Source: ${context.forecasts.source}):\n`;
    
    if (context.forecasts.source === "live" && context.forecasts.data?.list) {
      // OpenWeather format
      const list = context.forecasts.data.list.slice(0, 5); 
      list.forEach((f: any) => {
        contribution += `- Temp: ${f.main.temp}°C | Desc: ${f.weather?.[0]?.description} | Rain: ${f.rain?.["3h"] || 0}mm\n`;
      });
    } else if (Array.isArray(context.forecasts.data)) {
      // Stored Klimora format
      context.forecasts.data.slice(0, 5).forEach((f: any) => {
        contribution += `- Date: ${f.forecastDate} | Temp: ${f.temperatureC}°C | AQI: ${f.aqi} | Rainfall: ${f.rainfallMm}mm\n`;
      });
    } else {
      return null;
    }

    return { agentName: "ForecastIntelligenceAgent", contribution };
  }
}
