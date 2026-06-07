export const verificationPrompts: Record<string, string> = {
  'plant-tree': `Analyze this image for evidence of tree planting activity. Return JSON with EXACTLY these fields: {"evidenceDetected": boolean, "confidence": number, "detectedObjects": string[], "observations": string[], "reason": string}. Look for: tree sapling, planted in soil, outdoor setting.`,
  
  'rooftop-garden': `Analyze this image for evidence of a rooftop garden. Return JSON with EXACTLY these fields: {"evidenceDetected": boolean, "confidence": number, "detectedObjects": string[], "observations": string[], "reason": string}. Look for: plants in pots or soil beds, rooftop/terrace context.`,
  
  'rainwater-harvesting': `Analyze this image for evidence of rainwater harvesting infrastructure. Return JSON with EXACTLY these fields: {"evidenceDetected": boolean, "confidence": number, "detectedObjects": string[], "observations": string[], "reason": string}. Look for: collection pipes, storage tanks, rain catchment systems.`,
  
  'public-transport': `Analyze this image for evidence of public transport usage. Return JSON with EXACTLY these fields: {"evidenceDetected": boolean, "confidence": number, "detectedObjects": string[], "observations": string[], "reason": string}. Look for: bus/train interior, ticket/pass, transit station.`,
  
  'community-cleanup': `Analyze this image for evidence of community cleanup activity. Return JSON with EXACTLY these fields: {"evidenceDetected": boolean, "confidence": number, "detectedObjects": string[], "observations": string[], "reason": string}. Look for: garbage bags, people cleaning, collected waste in public space.`,
  
  'civic-reporting': `Analyze this image for evidence of a civic/environmental issue (e.g., illegal tree cutting, garbage burning). Return JSON with EXACTLY these fields: {"evidenceDetected": boolean, "confidence": number, "detectedObjects": string[], "observations": string[], "reason": string}. Look for: cut trees/stumps, burning waste, smoke, environmental damage.`
};

export const defaultVerificationPrompt = `Analyze this image for mission evidence. Return JSON with EXACTLY these fields: {"evidenceDetected": boolean, "confidence": number, "detectedObjects": string[], "observations": string[], "reason": string}.`;
