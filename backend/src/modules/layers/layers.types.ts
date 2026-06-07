/**
 * Environmental layer contracts.
 * TODO: Add tile manifest, provider source, and freshness metadata.
 */
export type EnvironmentalLayerType = "heat" | "vegetation" | "rainfall" | "aqi" | "climate" | "community";

export interface EnvironmentalLayerManifest {
  localityId: string;
  type: EnvironmentalLayerType;
  generatedAt: string;
}
