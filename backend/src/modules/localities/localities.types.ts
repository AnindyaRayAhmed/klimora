export interface Locality {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  description: string | null;
  createdAt: string;
}

export interface LocalityDto {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  description: string | null;
}
