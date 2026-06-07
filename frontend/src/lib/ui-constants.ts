// Realistic placeholder climate-intelligence data for Klimora

export type LocalityId = "indiranagar" | "koramangala" | "jayanagar" | "hsr" | "whitefield";

export type Locality = {
  id: LocalityId;
  name: string;
  boundary: string;            // administrative boundary label
  ward: string;
  city: string;
  pin: { left: string; top: string };
  coordinates: { lat: number; lng: number };

  // Climate Health Score breakdown (0–100, higher = healthier)
  climateScore: number;
  scoreDelta: number;          // change vs last month
  heatRisk: { value: number; label: "Low" | "Moderate" | "High" | "Severe" };
  airQuality: { aqi: number; label: string };
  vegetation: { ndvi: number; label: string };
  rainfall: { mm: number; label: string; delta: number };
  temperature: { value: number; delta: number };
  trend: "improving" | "stable" | "declining";

  recommendedActions: string[];
  context: string;             // 1-line Rit context
};

export const localities: Locality[] = [
  {
    id: "indiranagar",
    name: "Indiranagar",
    boundary: "Ward 80 · BBMP East Zone",
    ward: "Indiranagar",
    city: "Bengaluru",
    pin: { left: "34%", top: "40%" },
    coordinates: { lat: 12.9716, lng: 77.6411 },
    climateScore: 54,
    scoreDelta: -3,
    heatRisk: { value: 78, label: "High" },
    airQuality: { aqi: 142, label: "Unhealthy for Sensitive" },
    vegetation: { ndvi: 0.42, label: "Moderate canopy loss" },
    rainfall: { mm: 12, label: "Below normal", delta: -34 },
    temperature: { value: 34.2, delta: +2.4 },
    trend: "declining",
    recommendedActions: [
      "Plant native shade trees along 12th Main",
      "Start rooftop gardens on commercial blocks",
      "Restore lost canopy near metro corridor",
    ],
    context: "Dense built-up area with strong heat-island effect and rapid canopy decline along the metro corridor.",
  },
  {
    id: "koramangala",
    name: "Koramangala",
    boundary: "Ward 151 · BBMP South Zone",
    ward: "Koramangala",
    city: "Bengaluru",
    pin: { left: "60%", top: "56%" },
    coordinates: { lat: 12.9352, lng: 77.6245 },
    climateScore: 61,
    scoreDelta: +2,
    heatRisk: { value: 64, label: "Moderate" },
    airQuality: { aqi: 118, label: "Unhealthy for Sensitive" },
    vegetation: { ndvi: 0.48, label: "Moderate" },
    rainfall: { mm: 18, label: "Near normal", delta: -8 },
    temperature: { value: 33.4, delta: +1.6 },
    trend: "improving",
    recommendedActions: [
      "Expand the 80ft Road tree canopy program",
      "Restore Koramangala stormwater drain edges",
      "Add cycle-friendly low-emission corridors",
    ],
    context: "Mixed-use ward improving slowly thanks to recent canopy and lake-restoration efforts.",
  },
  {
    id: "jayanagar",
    name: "Jayanagar",
    boundary: "Ward 168 · BBMP South Zone",
    ward: "Jayanagar",
    city: "Bengaluru",
    pin: { left: "26%", top: "60%" },
    coordinates: { lat: 12.9293, lng: 77.5825 },
    climateScore: 72,
    scoreDelta: +4,
    heatRisk: { value: 48, label: "Moderate" },
    airQuality: { aqi: 96, label: "Moderate" },
    vegetation: { ndvi: 0.58, label: "Healthy" },
    rainfall: { mm: 22, label: "Normal", delta: +3 },
    temperature: { value: 31.8, delta: +0.6 },
    trend: "improving",
    recommendedActions: [
      "Maintain the legacy avenue trees",
      "Add bioswales on Jayanagar 4th Block",
      "Community composting at park edges",
    ],
    context: "One of the greenest wards in Bengaluru — strong canopy buffers daytime temperatures.",
  },
  {
    id: "hsr",
    name: "HSR Layout",
    boundary: "Ward 174 · BBMP Bommanahalli Zone",
    ward: "HSR Layout",
    city: "Bengaluru",
    pin: { left: "72%", top: "70%" },
    coordinates: { lat: 12.9116, lng: 77.6473 },
    climateScore: 48,
    scoreDelta: -1,
    heatRisk: { value: 82, label: "High" },
    airQuality: { aqi: 156, label: "Unhealthy" },
    vegetation: { ndvi: 0.38, label: "Low canopy" },
    rainfall: { mm: 9, label: "Water-stressed", delta: -42 },
    temperature: { value: 35.1, delta: +3.1 },
    trend: "declining",
    recommendedActions: [
      "Rainwater harvesting on Sector 1–3 rooftops",
      "Plant drought-tolerant native species",
      "Cool-roof program for tech parks",
    ],
    context: "Rapidly urbanising sector facing acute water stress and high surface temperatures.",
  },
  {
    id: "whitefield",
    name: "Whitefield",
    boundary: "Ward 84 · BBMP Mahadevapura Zone",
    ward: "Whitefield",
    city: "Bengaluru",
    pin: { left: "84%", top: "30%" },
    coordinates: { lat: 12.9698, lng: 77.7499 },
    climateScore: 58,
    scoreDelta: +1,
    heatRisk: { value: 70, label: "High" },
    airQuality: { aqi: 128, label: "Unhealthy for Sensitive" },
    vegetation: { ndvi: 0.44, label: "Moderate" },
    rainfall: { mm: 16, label: "Below normal", delta: -18 },
    temperature: { value: 34.0, delta: +1.9 },
    trend: "stable",
    recommendedActions: [
      "Restore the Varthur lake catchment",
      "Cluster trees along ITPL Road",
      "Community EV-charging adoption",
    ],
    context: "Tech corridor with construction-driven heat — stabilising thanks to lake-restoration push.",
  },
];

export const defaultLocality = localities[0];

export const environmentalSummary = {
  location: defaultLocality.name + ", " + defaultLocality.city,
  coordinates: defaultLocality.coordinates,
  temperature: { value: defaultLocality.temperature.value, unit: "°C", delta: defaultLocality.temperature.delta },
  aqi: { value: defaultLocality.airQuality.aqi, label: defaultLocality.airQuality.label, delta: +18 },
  vegetation: { value: defaultLocality.vegetation.ndvi, label: defaultLocality.vegetation.label, delta: -0.08 },
  rainfall: { value: defaultLocality.rainfall.mm, unit: "mm", label: defaultLocality.rainfall.label, delta: defaultLocality.rainfall.delta },
  risk: "High" as const,
};

// Climate timeline — multi-year history per locality (placeholder shared)
export const climateTimeline = [
  { year: "2019", temp: 30.4, ndvi: 0.62, aqi: 102, rain: 920, score: 72 },
  { year: "2020", temp: 30.8, ndvi: 0.58, aqi: 96,  rain: 1010, score: 70 },
  { year: "2021", temp: 31.5, ndvi: 0.54, aqi: 108, rain: 880, score: 66 },
  { year: "2022", temp: 32.6, ndvi: 0.49, aqi: 124, rain: 760, score: 61 },
  { year: "2023", temp: 33.4, ndvi: 0.45, aqi: 138, rain: 690, score: 57 },
  { year: "2024", temp: 34.2, ndvi: 0.42, aqi: 142, rain: 612, score: 54 },
];

export const temperatureTrend = [
  { month: "Jan", value: 28 }, { month: "Feb", value: 30 }, { month: "Mar", value: 32 },
  { month: "Apr", value: 35 }, { month: "May", value: 36 }, { month: "Jun", value: 33 },
  { month: "Jul", value: 31 }, { month: "Aug", value: 31 }, { month: "Sep", value: 32 },
  { month: "Oct", value: 33 }, { month: "Nov", value: 31 }, { month: "Dec", value: 29 },
];

export const vegetationTrend = climateTimeline.map((t) => ({ year: t.year, value: t.ndvi }));

export const rainfallTrend = [
  { month: "Jan", value: 4 }, { month: "Feb", value: 8 }, { month: "Mar", value: 14 },
  { month: "Apr", value: 38 }, { month: "May", value: 96 }, { month: "Jun", value: 78 },
  { month: "Jul", value: 102 }, { month: "Aug", value: 124 }, { month: "Sep", value: 168 },
  { month: "Oct", value: 142 }, { month: "Nov", value: 56 }, { month: "Dec", value: 12 },
];

export const aqiTrend = [
  { day: "Mon", value: 118 }, { day: "Tue", value: 132 }, { day: "Wed", value: 148 },
  { day: "Thu", value: 142 }, { day: "Fri", value: 156 }, { day: "Sat", value: 134 },
  { day: "Sun", value: 142 },
];

export type Mission = {
  id: string;
  title: string;
  description: string;
  category: "green" | "mobility" | "community" | "civic";
  points: number;
  difficulty: "Easy" | "Medium" | "Hard";
  impact: "Low" | "Moderate" | "High" | "Critical";
  verification: string;
  // Environmental Impact Calculator
  co2Kg: number;          // estimated CO₂ offset / avoided (kg)
  communityPts: number;   // community-impact points
  wardPts: number;        // ward-contribution points
  scoreLift: number;      // climate-score contribution (0–5)
  // Recommended-for tags (matched against locality conditions)
  recommendedFor?: ("low-vegetation" | "high-heat" | "water-stress" | "poor-aqi")[];
};

export const missions: Mission[] = [
  { id: "m1", title: "Plant a Tree", description: "Plant a native sapling in your locality. Upload geotagged photo and species details.", category: "green", points: 100, difficulty: "Medium", impact: "High", verification: "Photo + GPS + Timestamp", co2Kg: 21, communityPts: 12, wardPts: 18, scoreLift: 1.2, recommendedFor: ["low-vegetation", "high-heat"] },
  { id: "m2", title: "Maintain a Sapling", description: "Water and care for an existing sapling for one week. Submit weekly photo proof.", category: "green", points: 50, difficulty: "Easy", impact: "Moderate", verification: "Weekly photo proof", co2Kg: 4, communityPts: 6, wardPts: 8, scoreLift: 0.4 },
  { id: "m3", title: "Rooftop Garden", description: "Set up a rooftop garden with at least 6 plants. Reduces heat island effect.", category: "green", points: 250, difficulty: "Hard", impact: "High", verification: "Photo + Location", co2Kg: 38, communityPts: 22, wardPts: 30, scoreLift: 2.4, recommendedFor: ["high-heat"] },
  { id: "m4", title: "Balcony Garden", description: "Grow at least 4 air-purifying plants on your balcony.", category: "green", points: 120, difficulty: "Easy", impact: "Moderate", verification: "Photo proof", co2Kg: 8, communityPts: 5, wardPts: 7, scoreLift: 0.6, recommendedFor: ["poor-aqi"] },
  { id: "m5", title: "Rainwater Harvesting", description: "Install a rooftop rainwater harvesting unit. Helps recharge groundwater.", category: "green", points: 220, difficulty: "Hard", impact: "Critical", verification: "Photo + Installation receipt", co2Kg: 18, communityPts: 24, wardPts: 28, scoreLift: 2.0, recommendedFor: ["water-stress"] },
  { id: "m6", title: "Public Transport Day", description: "Use metro, bus, or train instead of personal vehicle for a full day.", category: "mobility", points: 10, difficulty: "Easy", impact: "Low", verification: "Ticket photo or route GPS", co2Kg: 6, communityPts: 2, wardPts: 3, scoreLift: 0.1, recommendedFor: ["poor-aqi"] },
  { id: "m7", title: "Cycle to Work", description: "Commute by bicycle for a week. Track your route.", category: "mobility", points: 80, difficulty: "Medium", impact: "Moderate", verification: "GPS route tracking", co2Kg: 32, communityPts: 8, wardPts: 12, scoreLift: 0.7, recommendedFor: ["poor-aqi"] },
  { id: "m8", title: "Lake Cleanup Drive", description: "Participate in a community cleanup event at a local water body.", category: "community", points: 100, difficulty: "Medium", impact: "High", verification: "Event photo + organizer verification", co2Kg: 5, communityPts: 28, wardPts: 22, scoreLift: 1.0, recommendedFor: ["water-stress"] },
  { id: "m9", title: "Volunteer with NGO", description: "Spend 4 hours volunteering with an environmental NGO.", category: "community", points: 150, difficulty: "Medium", impact: "High", verification: "NGO certificate upload", co2Kg: 3, communityPts: 30, wardPts: 18, scoreLift: 0.8 },
  { id: "m10", title: "Report Illegal Tree Cutting", description: "Document and report unauthorised tree cutting in your area.", category: "civic", points: 80, difficulty: "Easy", impact: "High", verification: "Photo + Location + Description", co2Kg: 12, communityPts: 14, wardPts: 16, scoreLift: 0.9, recommendedFor: ["low-vegetation"] },
  { id: "m11", title: "Report Garbage Burning", description: "Report open garbage burning to civic authorities.", category: "civic", points: 60, difficulty: "Easy", impact: "Moderate", verification: "Photo + Location", co2Kg: 9, communityPts: 10, wardPts: 12, scoreLift: 0.5, recommendedFor: ["poor-aqi"] },
  { id: "m12", title: "Report Water Encroachment", description: "Document encroachment on lakes, ponds, or stormwater drains.", category: "civic", points: 120, difficulty: "Medium", impact: "Critical", verification: "Photo + Coordinates + Description", co2Kg: 6, communityPts: 18, wardPts: 22, scoreLift: 1.4, recommendedFor: ["water-stress"] },
];

// Match recommended missions to a locality's conditions
export function getRecommendedMissions(loc: Locality): Mission[] {
  const tags: Mission["recommendedFor"] = [];
  if (loc.vegetation.ndvi < 0.5) tags!.push("low-vegetation");
  if (loc.heatRisk.value >= 65) tags!.push("high-heat");
  if (loc.rainfall.delta < -20) tags!.push("water-stress");
  if (loc.airQuality.aqi >= 120) tags!.push("poor-aqi");
  return missions.filter((m) => m.recommendedFor?.some((t) => tags!.includes(t))).slice(0, 6);
}

export const leaderboard = [
  { rank: 1, name: "Aarav Krishnan", ward: "Indiranagar", points: 4820, badge: "Canopy Keeper" },
  { rank: 2, name: "Priya Menon", ward: "Koramangala", points: 4310, badge: "Heat Defender" },
  { rank: 3, name: "Rohan Bhatt", ward: "Jayanagar", points: 3920, badge: "Green Steward" },
  { rank: 4, name: "Ananya Iyer", ward: "Indiranagar", points: 3640, badge: "Water Sentinel" },
  { rank: 5, name: "Vikram Shah", ward: "HSR Layout", points: 3185, badge: "Climate Ranger" },
  { rank: 6, name: "Meera Joshi", ward: "Whitefield", points: 2890, badge: "Community Guardian" },
  { rank: 7, name: "Karthik Rao", ward: "Indiranagar", points: 2640, badge: "Green Steward" },
];

export const wards = [
  { name: "Indiranagar", users: 1248, missions: 3420, trees: 842, points: 124800 },
  { name: "Koramangala", users: 1102, missions: 2980, trees: 712, points: 108400 },
  { name: "Jayanagar", users: 942, missions: 2640, trees: 604, points: 96200 },
  { name: "HSR Layout", users: 820, missions: 2210, trees: 488, points: 81800 },
  { name: "Whitefield", users: 768, missions: 1980, trees: 412, points: 72400 },
];

// Climate Rankings with movement (positive = climbed N places)
export type Ranking = {
  rank: number;
  name: string;
  score: number;
  movement: number;
  trend: "up" | "down" | "flat";
};

export const wardRankings: Ranking[] = [
  { rank: 1, name: "Jayanagar", score: 72, movement: +1, trend: "up" },
  { rank: 2, name: "Malleshwaram", score: 68, movement: +1, trend: "up" },
  { rank: 3, name: "Koramangala", score: 61, movement: +2, trend: "up" },
  { rank: 4, name: "Whitefield", score: 58, movement: 0, trend: "flat" },
  { rank: 5, name: "Indiranagar", score: 54, movement: -1, trend: "down" },
  { rank: 6, name: "HSR Layout", score: 48, movement: -2, trend: "down" },
];

export const municipalityRankings: Ranking[] = [
  { rank: 1, name: "BBMP South Zone", score: 66, movement: +1, trend: "up" },
  { rank: 2, name: "BBMP East Zone", score: 58, movement: 0, trend: "flat" },
  { rank: 3, name: "BBMP Mahadevapura", score: 56, movement: +1, trend: "up" },
  { rank: 4, name: "BBMP Bommanahalli", score: 51, movement: -2, trend: "down" },
];

export const cityRankings: Ranking[] = [
  { rank: 1, name: "Pune", score: 71, movement: +2, trend: "up" },
  { rank: 2, name: "Chennai", score: 64, movement: 0, trend: "flat" },
  { rank: 3, name: "Bengaluru", score: 58, movement: -1, trend: "down" },
  { rank: 4, name: "Hyderabad", score: 55, movement: +1, trend: "up" },
  { rank: 5, name: "Delhi", score: 41, movement: 0, trend: "flat" },
];


