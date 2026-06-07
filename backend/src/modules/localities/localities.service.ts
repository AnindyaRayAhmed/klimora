import { NotFoundError } from "../../shared/errors.js";
import type { LocalityDto } from "./localities.types.js";
import { LocalitiesRepository } from "./localities.repo.js";

export class LocalitiesService {
  constructor(private readonly localitiesRepository: LocalitiesRepository) {}

  async listLocalities(): Promise<LocalityDto[]> {
    const localities = await this.localitiesRepository.findAll();
    return localities.map((locality) => this.toDto(locality));
  }

  async getLocality(id: string): Promise<LocalityDto> {
    const locality = await this.localitiesRepository.findById(id);

    if (!locality) {
      throw new NotFoundError("Locality not found.");
    }

    return this.toDto(locality);
  }

  private toDto(locality: LocalityDto): LocalityDto {
    return {
      id: locality.id,
      slug: locality.slug,
      name: locality.name,
      city: locality.city,
      state: locality.state,
      country: locality.country,
      latitude: locality.latitude,
      longitude: locality.longitude,
      description: locality.description,
    };
  }
}
